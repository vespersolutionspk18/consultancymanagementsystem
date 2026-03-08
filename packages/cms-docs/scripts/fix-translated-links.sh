#!/bin/bash

# Post-processing script to fix internal links in translated documentation
# This script adds the locale prefix to all internal documentation links
# Works for any language by automatically detecting language directories

set -e

if [ -d "packages/cms-docs" ]; then
  DOCS_DIR="packages/cms-docs/l"
elif [ -d "l" ]; then
  DOCS_DIR="l"
else
  echo "❌ Error: Cannot find locales directory (l/)"
  exit 1
fi

echo "🔧 Fixing internal links in translated documentation..."

for lang_dir in "$DOCS_DIR"/*/ ; do
  lang_code=$(basename "$lang_dir")

  if [ ! -d "$lang_dir" ] || [ -z "$(ls -A "$lang_dir")" ]; then
    continue
  fi

  echo "📝 Processing $lang_code documentation..."

  find "$lang_dir" -name "*.mdx" -type f -exec sed -i.bak \
    "s|href=\"/user-guide/|href=\"/l/$lang_code/user-guide/|g" {} \;
  find "$lang_dir" -name "*.mdx" -type f -exec sed -i.bak \
    "s|href=\"/developers/|href=\"/l/$lang_code/developers/|g" {} \;
  find "$lang_dir" -name "*.mdx" -type f -exec sed -i.bak \
    "s|href=\"/cms-ui/|href=\"/l/$lang_code/cms-ui/|g" {} \;

  find "$lang_dir" -name "*.mdx" -type f -exec sed -i.bak \
    "s|](/user-guide/|](/l/$lang_code/user-guide/|g" {} \;
  find "$lang_dir" -name "*.mdx" -type f -exec sed -i.bak \
    "s|](/developers/|](/l/$lang_code/developers/|g" {} \;
  find "$lang_dir" -name "*.mdx" -type f -exec sed -i.bak \
    "s|](/cms-ui/|](/l/$lang_code/cms-ui/|g" {} \;

  find "$lang_dir" -name "*.mdx" -type f -exec sed -i.bak \
    "s|https://docs\.cms\.com/user-guide/|https://docs.cms.com/l/$lang_code/user-guide/|g" {} \;
  find "$lang_dir" -name "*.mdx" -type f -exec sed -i.bak \
    "s|https://docs\.cms\.com/developers/|https://docs.cms.com/l/$lang_code/developers/|g" {} \;
  find "$lang_dir" -name "*.mdx" -type f -exec sed -i.bak \
    "s|https://docs\.cms\.com/cms-ui/|https://docs.cms.com/l/$lang_code/cms-ui/|g" {} \;

  find "$lang_dir" -name "*.mdx" -type f -exec sed -i.bak \
    "s|https://docs\.cms\.com/user-guide/|https://docs.cms.com/$lang_code/user-guide/|g" {} \;
  find "$lang_dir" -name "*.mdx" -type f -exec sed -i.bak \
    "s|https://docs\.cms\.com/developers/|https://docs.cms.com/$lang_code/developers/|g" {} \;
  find "$lang_dir" -name "*.mdx" -type f -exec sed -i.bak \
    "s|https://docs\.cms\.com/cms-ui/|https://docs.cms.com/$lang_code/cms-ui/|g" {} \;

  find "$lang_dir" -name "*.bak" -type f -delete

  echo "✅ $lang_code documentation links fixed"
done

echo "🎉 All translated links have been fixed!"

