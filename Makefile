help:
	@echo ""
	@echo "usage: make COMMAND"
	@echo ""
	@echo "Commands:"
	@echo "  install			install"
	@echo "  C				client build"
	@echo "  S				server start"
	@echo "  CS				client build && server start"
	@echo "  Cdev				client development with proxy server"
	@echo "  Clint				client lint"

project_root:=$(CURDIR)

.PHONY: install
install:
	cd client && npm install
	npm install

.PHONY: C
C:
	cd client && npm run build

.PHONY: S
S:
	pm2 stop www && pm2 start www 

.PHONY: CS
CS:
	make C
	make S

.PHONY: Clint
Clint:
	cd client && npm run lint

# proxy with server
.PHONY: Cdev
Cdev:
	cd client && npm run serve

