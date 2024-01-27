# hugo_website
work in progress

- [ ] setup Tekton Pipeline - ci
- [ ] setup quay
- [ ] create tag
- [ ] add devfile
- [ ] adjust renovate bot for devfile
- [ ] adjust github workflows, versioning, bump, changelog
- [ ] Dockerfile: use another nginx alpine base image in second build step, remove nginx configuration
- [ ] Calendly link entfernen
- [ ] write readme

- [ ] clone template repository - [link](https://gitlab.com/smichard/template_repository)
- [ ] delete `.git` folder
- [ ] container registry operations
	- [ ] create container repository
	- [ ] set visibility to public
	- [ ] enable service account
- [ ] git operations:
	- [ ] create git repository
	- [ ] revisit and adjust `.gitignore` file
	- [ ] revisit and adjust GitHub Actions
	- [ ] revisit and adjust License file
	- [ ] create GitHub Secrets
		- [ ] MATRIX_ACCESS_TOKEN
		- [ ] MATRIX_ROOM_ID - !MFCIgAJHWuyqnwCSzF:matrix.web.michard.cc
		- [ ] MATRIX_SERVER - matrix.web.michard.cc
		- [ ] TEKTON_WEBHOOK
- [ ] adjust devfile
- [ ] adjust CI / CD pipeline
	- [ ] revisit and adjust custom Tekton tasks
	- [ ] delete `tekton` folder
	- [ ] revisit and adjust Tekton pipeline
- [ ] Read Me
	- [ ] adjust `quay.io` badge
	- [ ] adjust devspaces badge
	- [ ] adjust git badges
	- [ ] short description for the project
- [ ] initialize git repository
- [ ] create initial git tag: `git tag -a 0.1.0 -m "initial tag" `
- [ ] push git repository
- [ ] push tag to GitHub: `git push origin --tags`
- [ ] setup pipeline: `oc apply -f ci/pipeline.yml`
- [ ] setup pipeline trigger
- [ ] enable renovate bot


[![Tag](https://img.shields.io/github/v/tag/smichard/hugo_website)](https://github.com/smichard/hugo_website/tags)
[![PRs](https://img.shields.io/github/issues-pr-raw/smichard/hugo_website)](https://github.com/smichard/hugo_website/pulls)
[![Registry](https://img.shields.io/badge/Quay-Container_Registry-46b9e5)](https://quay.io/repository/michard/hugo_website)
[![DevSpace](https://www.eclipse.org/che/contribute.svg)](https://devspaces.apps.ocp.michard.cc#https://github.com/smichard/hugo_website)
