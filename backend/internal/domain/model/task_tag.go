package model

type TaskCategoryType struct {
	ID   string
	Slug string
	Name string
}

type TaskCategoryTypes []*TaskCategoryType

type TaskTag struct {
	ID               string
	Name             string
	CategoryTypeID   string
	CategoryTypeName string
}

type TaskTags []*TaskTag
