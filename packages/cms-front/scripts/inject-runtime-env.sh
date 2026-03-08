#!/bin/sh

echo "Injecting runtime environment variables into index.html..."

CONFIG_BLOCK=$(cat << EOF
    <script id="cms-env-config">
      window._env_ = {
        REACT_APP_SERVER_BASE_URL: "$REACT_APP_SERVER_BASE_URL"
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
