#!/bin/sh

echo "Injecting runtime environment variables into index.html..."

# Use REACT_APP_SERVER_BASE_URL from env if explicitly set to a real URL.
# localhost URLs are skipped — the frontend's getDefaultUrl() fallback
# will use window.location.origin, which is correct for all deployments.
SERVER_URL="${REACT_APP_SERVER_BASE_URL:-}"

case "$SERVER_URL" in
  http://localhost*|http://127.0.0.1*|"") SERVER_URL="" ;;
esac

CONFIG_BLOCK=$(cat << EOF
    <script id="cms-env-config">
      window._env_ = {
        REACT_APP_SERVER_BASE_URL: "$SERVER_URL"
      };
    </script>
    <!-- END: CMS Config -->
EOF
)
# Use sed to replace the config block in index.html
# Using pattern space to match across multiple lines
echo "$CONFIG_BLOCK" | sed -i.bak '
  /<!-- BEGIN: CMS Config -->/,/<!-- END: CMS Config -->/{
    /<!-- BEGIN: CMS Config -->/!{
      /<!-- END: CMS Config -->/!d
    }
    /<!-- BEGIN: CMS Config -->/r /dev/stdin
    /<!-- END: CMS Config -->/d
  }
' build/index.html
rm -f build/index.html.bak
