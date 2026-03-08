# How to deploy cms on podman

DISCLAIMER: The k8s and podman deployments are not maintained by the core team.
These files are provided and maintained by the community. CMS core team
maintains support for docker deployment.


## How to use

1. Edit `.env` file. At the minimum set `POSTGRES_PASSWORD`, `SERVER_URL`, and `APP_SECRET`.
2. Start cms by running `podman-compose up -d`.

If you need to stop cms, you can do so by running `podman-compose down`.


### Install systemd service (optional)

If you want to install a systemd service to run cms, you can use the provided systemd service. 

Edit `cmscrm.service` and change these two variables:


	WorkingDirectory=/opt/apps/cms
	EnvironmentFile=/opt/apps/cms/.env

`WorkingDirectory` should be changed to the path in which `podman-compose.yml` is located.

`EnvironmentFile` should be changed to the path in which your `.env`file is located.

You can run the script `install-systemd-user-service` to install the systemd service under the current user.


	./install-systemd-user-service

Note: this script will enable the service and also start it. So it will assume that cms is not currently running.
If you started it previously, bring it down using:

	podman-compose down



## Compatibility

These files should be compatible with podman 4.3+.

I have tested this on Debian GNU/Linux 12 (bookworm) and with the podman that is distributed with the official Debian stable mirrors (podman v4.3.1+ds1-8+deb12u1, podman-compose v1.0.3-3).


