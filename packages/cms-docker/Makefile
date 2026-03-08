# Makefile for building CMS CRM docker images.
# Set the tag and/or target build platform using make command-line variables assignments.
#
# Optional make variables:
# PLATFORM - defaults to 'linux/amd64'
# TAG      - defaults to 'latest'
#
# Example: make
# Example: make PLATFORM=linux/aarch64 TAG=my-tag

PLATFORM ?= linux/amd64
TAG ?= latest

prod-build:
	@cd ../.. && docker build -f ./packages/cms-docker/cms/Dockerfile --platform $(PLATFORM) --tag cms:$(TAG) . && cd -

prod-run:
	@docker run -d -p 3000:3000 --name cms cms:$(TAG)

prod-postgres-run:
	@docker run -d -p 5432:5432 -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres --name cms-postgres cms-postgres:$(TAG)

prod-website-build:
	@cd ../.. && docker build -f ./packages/cms-docker/cms-website/Dockerfile --platform $(PLATFORM) --tag cms-website:$(TAG) . && cd -

prod-website-run:
	@docker run -d -p 3000:3000 --name cms-website cms-website:$(TAG)
