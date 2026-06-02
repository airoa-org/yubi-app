package main

import (
	"context"
	"database/sql"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/airoa-org/yubi-app/backend/internal/authz"
	"github.com/airoa-org/yubi-app/backend/internal/ccontext"
	"github.com/airoa-org/yubi-app/backend/internal/config"
	"github.com/airoa-org/yubi-app/backend/internal/database/ddtrace"
	"github.com/airoa-org/yubi-app/backend/internal/database/entity"
	"github.com/airoa-org/yubi-app/backend/internal/event"
	"github.com/airoa-org/yubi-app/backend/internal/gateway"
	"github.com/airoa-org/yubi-app/backend/internal/gen/openapi"
	"github.com/airoa-org/yubi-app/backend/internal/interfaces/http/controller"
	"github.com/airoa-org/yubi-app/backend/internal/interfaces/http/handler"
	"github.com/airoa-org/yubi-app/backend/internal/interfaces/http/middleware"
	"github.com/airoa-org/yubi-app/backend/internal/log"
	"github.com/airoa-org/yubi-app/backend/internal/redis"
	s3client "github.com/airoa-org/yubi-app/backend/internal/s3"
	"github.com/airoa-org/yubi-app/backend/internal/usecase"

	"github.com/getsentry/sentry-go"
	sentrygin "github.com/getsentry/sentry-go/gin"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect/pgdialect"
	"github.com/uptrace/bun/driver/pgdriver"
	gintrace "gopkg.in/DataDog/dd-trace-go.v1/contrib/gin-gonic/gin"
	redistrace "gopkg.in/DataDog/dd-trace-go.v1/contrib/redis/go-redis.v9"
	ddtracer "gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"
)

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	if err := run(ctx); err != nil {
		fmt.Fprintf(os.Stderr, "stop server: %v\n", err)
		os.Exit(1)
	}
}

func run(ctx context.Context) error {
	conf, err := config.NewConfig(ctx)
	if err != nil {
		return fmt.Errorf("failed to load config: %w", err)
	}

	logger := log.NewZerologLogger(conf.AppName, conf.Environment)

	entity.OrgIDFromContext = func(ctx context.Context) (string, bool) {
		id, err := ccontext.OrganizationID(ctx)
		return id, err == nil && id != ""
	}

	if conf.Datadog.Enabled {
		ddtracer.Start(
			ddtracer.WithService(conf.AppName),
			ddtracer.WithEnv(conf.Environment),
		)
		defer ddtracer.Stop()
		logger.Info().Msg("datadog tracer started")
	}

	// Initialize Sentry
	if conf.Sentry.DSN != "" {
		err := sentry.Init(sentry.ClientOptions{
			Dsn:              conf.Sentry.DSN,
			Environment:      conf.Sentry.Environment,
			TracesSampleRate: conf.Sentry.TracesSampleRate,
			EnableTracing:    conf.Sentry.TracesSampleRate > 0,
		})
		if err != nil {
			logger.Error().Err(err).Msg("failed to initialize sentry")
		} else {
			logger.Info().Msg("sentry initialized")
			defer sentry.Flush(2 * time.Second)
		}
	}

	logger.Info().Msg("starting application")

	userRepo := gateway.NewUser()
	userLocationRepo := gateway.NewUserLocation()
	userSiteRepo := gateway.NewUserSite()
	orgRepo := gateway.NewOrganization()
	siteRepo := gateway.NewSite()
	locRepo := gateway.NewLocation()
	robotRepo := gateway.NewRobot()
	taskRepo := gateway.NewTask()
	taskTagRepo := gateway.NewTaskTag()
	taskVersionRepo := gateway.NewTaskVersion()
	subtaskRepo := gateway.NewSubTask()
	episodeRepo := gateway.NewEpisode()
	episodeGradeRepo := gateway.NewEpisodeGrade()
	episodeSubTaskRepo := gateway.NewEpisodeSubTask()
	episodeSubTaskExecutionRepo := gateway.NewEpisodeSubTaskExecution()
	apiKeyRepo := gateway.NewAPIKey()

	redisClient, err := redis.NewClient(
		conf.Redis.Host,
		conf.Redis.Port,
		conf.Redis.Password,
		conf.Redis.DB,
	)
	if err != nil {
		return fmt.Errorf("failed to connect to redis: %w", err)
	}
	defer redisClient.Close()

	if conf.Datadog.Enabled {
		redisClient.EnableDDTrace(redistrace.WithServiceName(conf.AppName + "-redis"))
	}

	robotStatusRepo := gateway.NewRobotStatus(redisClient)
	robotUptimeDeltaRepo := gateway.NewRobotUptimeDelta(redisClient)

	s3Client, err := s3client.NewClient(ctx, conf.S3.Region, conf.S3.BucketName, conf.S3.PresignedURLExpirySec, conf.S3.Endpoint, conf.S3.PresignEndpoint, conf.S3.AccessKeyID, conf.S3.SecretAccessKey)
	if err != nil {
		return fmt.Errorf("failed to initialize S3 client: %w", err)
	}
	episodeRecordingRepo := gateway.NewEpisodeRecording(s3Client)

	dsn := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=%s",
		conf.Database.User,
		conf.Database.Password,
		conf.Database.Host,
		conf.Database.Port,
		conf.Database.Name,
		conf.Database.SSLMode,
	)

	sqldb := sql.OpenDB(pgdriver.NewConnector(pgdriver.WithDSN(dsn)))
	db := bun.NewDB(sqldb, pgdialect.New())
	if conf.Datadog.Enabled {
		db.AddQueryHook(ddtrace.NewBunHook(conf.AppName + "-db"))
	}

	userUsecase := usecase.NewUser(userRepo, userLocationRepo, userSiteRepo, db, logger)
	userImportUsecase := usecase.NewUserImport(userRepo, db, logger)
	orgUsecase := usecase.NewOrganization(orgRepo, db)
	siteUsecase := usecase.NewSite(siteRepo, db)
	locUsecase := usecase.NewLocation(locRepo, db)
	robotUsecase := usecase.NewRobot(robotRepo, robotStatusRepo, robotUptimeDeltaRepo, db)
	robotStatusBus := event.NewBus()
	robotDeviceUsecase := usecase.NewRobotDevice(robotRepo, robotStatusRepo, robotUptimeDeltaRepo, db, logger, robotStatusBus)
	taskTagUsecase := usecase.NewTaskTag(taskTagRepo, db)
	taskImportUsecase := usecase.NewTaskImport(taskRepo, taskTagRepo, db)
	taskExportUsecase := usecase.NewTaskExport(taskRepo, taskTagRepo, db)
	taskUsecase := usecase.NewTask(taskRepo, taskTagRepo, episodeRepo, taskVersionRepo, db)
	taskVersionUsecase := usecase.NewTaskVersion(taskVersionRepo, taskRepo, subtaskRepo, episodeRepo, db)
	subtaskUsecase := usecase.NewSubTask(subtaskRepo, taskRepo, taskVersionRepo, db)
	episodeBus := event.NewBus()
	robotEpisodeBus := event.NewBus()
	episodeListBus := event.NewBus()
	episodeUsecase := usecase.NewEpisode(episodeRepo, episodeGradeRepo, logger, taskVersionRepo, subtaskRepo, episodeSubTaskRepo, episodeSubTaskExecutionRepo, robotRepo, robotStatusRepo, episodeRecordingRepo, taskRepo, locRepo, siteRepo, db, episodeBus, robotEpisodeBus, episodeListBus)
	episodeGradeUsecase := usecase.NewEpisodeGrade(episodeGradeRepo, db)
	episodeExportUsecase := usecase.NewEpisodeExport(episodeRepo, db)
	operatorYieldRepo := gateway.NewOperatorYield()
	operatorYieldExportUsecase := usecase.NewOperatorYieldExport(operatorYieldRepo, db, logger)
	episodeSubTaskUsecase := usecase.NewEpisodeSubTask(episodeRepo, episodeSubTaskRepo, db, episodeBus, robotEpisodeBus, episodeListBus)
	episodeExecutionUsecase := usecase.NewEpisodeExecution(episodeRepo, episodeSubTaskRepo, episodeSubTaskExecutionRepo, db, episodeBus, robotEpisodeBus, episodeListBus)
	fleetRepo := gateway.NewFleet()
	fleetUsecase := usecase.NewFleet(fleetRepo, db)
	robotOperatorRepo := gateway.NewRobotOperator(redisClient)
	robotOperatorUsecase := usecase.NewRobotOperator(robotOperatorRepo)
	apiKeyUsecase := usecase.NewAPIKey(apiKeyRepo, userRepo, robotRepo, db, logger)

	ctrl := controller.NewController(
		logger,
		userUsecase,
		userImportUsecase,
		orgUsecase,
		siteUsecase,
		locUsecase,
		robotUsecase,
		robotDeviceUsecase,
		taskUsecase,
		taskVersionUsecase,
		taskTagUsecase,
		taskImportUsecase,
		taskExportUsecase,
		subtaskUsecase,
		episodeUsecase,
		episodeGradeUsecase,
		episodeExportUsecase,
		episodeSubTaskUsecase,
		episodeExecutionUsecase,
		fleetUsecase,
		robotOperatorUsecase,
		operatorYieldExportUsecase,
		apiKeyUsecase,
	)

	router := gin.Default()
	router.ContextWithFallback = true

	if conf.Datadog.Enabled {
		router.Use(gintrace.Middleware(conf.AppName))
	}

	// Sentry middleware for panic recovery and performance tracing
	if conf.Sentry.DSN != "" {
		router.Use(sentrygin.New(sentrygin.Options{
			Repanic: true,
		}))
	}

	router.Use(middleware.ErrorLogger(logger))

	allowedOrigins := []string{"http://localhost:3000"}

	router.Use(cors.New(cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-User-ID", "X-Robot-ID", "X-API-Key"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	router.GET("/health-check", func(c *gin.Context) {
		c.String(http.StatusOK, "OK")
	})

	errorHandler := middleware.NewErrorHandler(logger)
	strictMiddlewares := []openapi.StrictMiddlewareFunc{
		authz.NewAuthzMiddleware(),
		errorHandler.ConvertErrorResponseWithLogging(),
	}
	strictHandler := openapi.NewStrictHandler(ctrl, strictMiddlewares)
	api := router.Group("/api")

	api.Use(middleware.Auth(userUsecase, robotUsecase, apiKeyUsecase))

	// Limit body size before Gin deserializes the request body.
	// Import endpoints accept CSV payloads up to 5MB wrapped in JSON, so 6MB
	// provides a safe margin. This protects all routes from OOM via large payloads.
	const apiBodyLimit = 6 * 1024 * 1024 // 6MB
	api.Use(middleware.MaxBodySize(apiBodyLimit))

	openapi.RegisterHandlers(api, strictHandler)

	sseHandler := handler.NewSSEHandler(ctx, logger, robotDeviceUsecase, episodeUsecase, taskUsecase, taskVersionUsecase, episodeBus, robotEpisodeBus, episodeListBus, robotStatusBus)
	api.GET("/robots/:robotId/status/stream", sseHandler.StreamRobotStatus)
	api.GET("/robots/status/stream", sseHandler.StreamRobotStatusByIds)
	api.GET("/episodes/stream", sseHandler.StreamEpisodeListUpdates)
	api.GET("/episodes/:episodeId/stream", sseHandler.StreamEpisodeUpdates)
	api.GET("/robots/:robotId/teleop/stream", sseHandler.StreamRobotTeleop)

	addr := fmt.Sprintf(":%s", conf.AppPort)

	srv := &http.Server{
		Addr:         addr,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		logger.Info().Str("addr", addr).Msg("Server starting")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatal().Err(err).Msg("Server failed to start")
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	sig := <-quit
	logger.Info().Str("signal", sig.String()).Msg("Received signal. Shutting down server...")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		logger.Fatal().Err(err).Msg("Server forced to shutdown")
	}

	if db != nil {
		if err := db.Close(); err != nil {
			logger.Error().Err(err).Msg("failed to close db")
		}
	}

	logger.Info().Msg("Server stopped gracefully")

	return nil
}
