variable "environment" {
  description = "Deployment environment name (staging or production)."
  type        = string
}

variable "region" {
  description = "AWS region."
  type        = string
  default     = "eu-west-1"
}
