# User Guide

## What is Yubi App?

Yubi App is a platform for managing **robot teleoperation data collection**. If you have robots that perform tasks (picking objects, assembling parts, etc.) and you need to systematically collect, track, and review that data — this is the tool for that.

The system works like this.

1. **You define tasks** — "Pick up the bottle and place it on the plate"
2. **You assign episodes** — "Robot-01 should perform this task at Location A"
3. **The robot executes** — The robot picks up the task, performs it, and reports back
4. **You review the results** — See what happened, how long it took, and whether it succeeded

All of this is managed through a web interface, while robots communicate via a REST API.

## Getting Started

### First-time Setup

After starting the application (`make up && make migrate && make seed`), open:

```
http://localhost:3000/web
```

The seed data creates a ready-to-use environment with the following.

- 1 organization, 1 site, 1 location
- 1 admin user
- 1 robot
- 1 task with 3 subtasks
- Sample episodes in various states

You are logged in as the default Admin user. To switch to a different user, click the user avatar in the top-right corner and select **"Switch Account"**.

> **Warning**: Do not switch users during active operations such as teleoperation sessions or episode recording. Switching changes the user context for all subsequent API requests, which can cause data inconsistency with in-progress sessions started under the previous user.

You can explore the UI immediately without any additional setup.

### Understanding the Data Model

Everything in the system is organized under an **Organization** (your team or company). Within an organization:

```
Organization
  └── Site (e.g., "Tokyo Office")
       └── Location (e.g., "Lab Room A")
            └── Robot (e.g., "Robot-01")

Organization
  └── Task (e.g., "Pick and place bottle")
       └── Task Version (v1.0.0)
            ├── Subtask 1: "Detect the object"
            ├── Subtask 2: "Pick up the object"
            └── Subtask 3: "Place on the plate"

Episode = "Robot-01 performs Pick-and-place v1.0.0 at Lab Room A"
```

An **Episode** is the central concept — it represents one execution of a task by a robot. Episodes flow through these states:

```
Ready → Recording → Completed
                  → Cancelled
```

## Tutorial: Your First Data Collection

This walkthrough takes you through the complete process from scratch.

### Step 1: Set Up Your Workspace

Before collecting data, you need a place for robots to work.

1. Go to **Locations** (`/web/locations`)
2. If you need a new site, create one (e.g., "My Lab")
3. Create a location within the site (e.g., "Workbench A")

> The seed data already includes a site and location, so you can skip this step if you're just exploring.

### Step 2: Register a Robot

1. Go to **Robots** (`/web/robots`)
2. Click **"Create Robot"**
3. Fill in the following fields.
   - **Location**: Where the robot operates
   - **Name**: A human-readable name (e.g., "Robot-01")
   - **Robot Type**: The model or type (e.g., "UR10e")
   - **Robot Config** (optional): Camera and connection settings as JSON

```json
{
  "host": "192.168.1.100",
  "port": 9090,
  "cameras": [
    {"namespace": "camera_0", "name": "Front Camera"}
  ]
}
```

After creation, the robot starts in **Offline** status. It will become **Online** once it starts sending heartbeats via the Robot API.

### Step 3: Define a Task

Tasks describe what the robot should do. Each task has an ordered list of subtasks.

1. Go to **Tasks** (`/web/tasks`)
2. Click **"Create Task"**
3. Fill in the following fields.
   - **Name**: e.g., "Pick up bottle and place on plate"
   - **Description**: Detailed instructions
   - **Manual URL**: Link to a reference document
   - **Priority / Difficulty**: For organizing and filtering
   - **Robot Type**: Which robot model can perform this task
4. After creating the task, add a **Task Version** with subtasks.
   - Subtask 1: "Detect the bottle"
   - Subtask 2: "Pick up the bottle"
   - Subtask 3: "Place on the plate"
5. **Approve** the task version to make it available for episodes

### Step 4: Create Episodes

Episodes are the actual assignments — "this robot should do this task."

1. Go to **Episodes** (`/web/episodes`)
2. Click **"Create Episode"**
3. Select the following.
   - **Task**: The task you created
   - **Robot**: The robot that will execute it
   - **Location**: Where the execution happens
4. Click **"Create"**

The episode is now in **Ready** status, waiting for the robot to pick it up.

> **Tip**: Set the **count** field to more than 1 in the create dialog to create multiple episodes at once (e.g., 10 episodes of the same task for the same robot).

### Step 5: Robot Executes the Episode

This step happens on the robot side via the REST API. See the [Robot API Guide](robot-api-guide.md) for details.

In summary, the robot does the following.

1. Fetches its assigned episodes (`GET /api/robot/episodes`)
2. Starts an episode (`POST /api/robot/episodes/{id}/start`)
3. Executes each subtask (create execution → start → finish → complete)
4. Finishes the episode (`POST /api/robot/episodes/{id}/finish`)

While the robot is working, the episode status changes from **Ready** → **Recording** → **Completed**.

> **No physical robot?** You can simulate the robot using curl commands from the [Robot API Guide](robot-api-guide.md). Start by sending a status heartbeat to bring the robot online (`PUT /api/robot/status`), then follow the episode execution flow to complete an episode manually.

### Step 6: Review the Results

1. Go to **Episodes** (`/web/episodes`)
2. Filter by status (e.g., "Completed") to find finished episodes
3. Click an episode to see the details.
   - Timing (when it started, how long each subtask took)
   - Subtask execution history (attempts, successes, skips)
   - Recording data (if the robot uploaded recordings)

## Real-time Monitoring

### Robot Status

The **Robots** page (`/web/robots`) shows live status for all robots:

| Status | Meaning |
|--------|---------|
| **Online** | Robot is connected and ready to accept tasks |
| **Busy** | Robot is currently executing an episode |
| **Offline** | Robot is not sending heartbeats |
| **Faulted** | Robot has reported an error |
| **Maintenance** | Robot is under maintenance |

Status updates happen in real-time via Server-Sent Events (SSE) — no need to refresh the page.

### Teleoperation Console

For robots that are **Online**, you can open the teleoperation console to operate them in real-time.

1. Click an online robot from the robot list
2. Click **"Start Teleoperation"**
3. Select or create an episode
4. Use the console to monitor and control subtask execution

The console shows the following.

- Live camera feeds (requires `robot_config` with camera settings)
- Subtask control panel (start, complete, skip subtasks)
- Robot sensor data in real-time
- Episode progress

> **Prerequisite**: The robot must be actively sending heartbeats (`PUT /api/robot/status`) to appear as Online. Without a physical robot, you can simulate this — see [Update Robot Status](robot-api-guide.md#update-robot-status) in the Robot API Guide.

### Dashboard

The **Dashboard** (`/web/dashboard`) provides a fleet-level overview.

- How many episodes were completed today/this week
- Collection trends over time
- Active robots and their current status

## API Key Management (Admin Only)

API keys allow robots to authenticate with the platform without using manual header configuration. Admin users can issue, view, and revoke keys.

### Issuing an API Key

1. Go to **API Keys** (`/web/api-keys`)
2. Click **"Create API Key"**
3. Enter a name and select the robot to bind it to
4. Click **"Create"**
5. **Copy the raw key immediately** — it is shown only once and cannot be retrieved later

The key is bound to a specific robot and the user who created it. When a robot authenticates with this key, the system identifies both the robot and the user automatically.

### Revoking an API Key

1. Go to **API Keys** (`/web/api-keys`)
2. Find the key in the list
3. Click **"Revoke"** and confirm

Revoked keys immediately stop working. This action cannot be undone.

### Key Lifecycle

- Keys can have an optional expiration date (set during creation)
- `Last Used` column shows when the key was last used for authentication
- Revoked keys remain visible in the list (toggle "Include revoked" to see them)

## User Roles

Not everyone needs the same access. The system has five roles:

| Role | What they can do |
|------|------------------|
| **Admin** | Everything — manage users, robots, tasks, episodes, sites, locations, API keys |
| **Data Engineer** | Manage tasks, robots, episodes. Read-only for locations |
| **Manager** | Same as Data Engineer |
| **Operator** | Create and update episodes, operate robots. Read-only for tasks and locations |
| **Viewer** | Read-only access to everything |

### Managing Users

1. Go to **Users** (`/web/users`)
2. Create users with **"Create User"** (email, name, role)
3. Assign users to specific locations and sites to scope their access
4. Import users in bulk via CSV upload (columns: `email`, `display_name`, `role`)

## Importing Data

### Import Tasks from CSV

1. Go to Tasks → click **"Import"**
2. Upload a CSV with columns: `name`, `description`, `priority`, `difficulty`, etc.
3. Review validation results (valid rows, duplicates, errors)
4. Confirm to import

### Import Users from CSV

1. Go to Users → click **"Import"**
2. Upload a CSV with columns: `email`, `display_name`, `role`
3. Review and confirm

## Exporting Data

### Episode Export

1. Go to **Episodes**
2. Apply filters (task, robot, date range, status)
3. Click **"Export"** to download a CSV

### Operator Yield Report

1. Go to **Dashboard** → Reports
2. Select date range
3. Export operator productivity data as CSV

## Tips

- **Bookmarkable filters**: All filter states are stored in the URL. Share filtered views with team members by copying the URL.
- **Real-time updates**: Robot status and episode progress update automatically. No need to refresh.
- **Bulk episode creation**: Set count > 1 in the episode create dialog to create many repetitions of the same task at once.
- **Task versioning**: When you update subtasks, create a new task version rather than editing the existing one. This preserves the history of what was executed in past episodes.
