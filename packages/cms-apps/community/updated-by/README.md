# Updated by

Updates Updated by field with details of person behind newest update

## Requirements
- cms-cli `npm install -g cms-cli`
- an `apiKey`. Go to `https://cms.com/settings/api-webhooks` to generate one

## Quick start

1. Add application
```bash
cms auth login
cd packages/cms-apps/updated-by
cms app sync
```

2. Configure **CMS_API_KEY**

Go to Settings > Applications > Updated by > Settings and add CMS API key used to
send requests to CMS. 

**If you're using self-hosted instance, you have to add also URL to your workspace.**

## Flow

1. Check if CMS API key is added, if not, exit
2. Check if updated record belongs to an object which shouldn't have a `updatedBy` field (like blocklists or messages), if yes, exit
3. Check if updated record has updatedBy field, if not, create it
4. Check if updated field in record is updatedBy field, if yes, return preemptively
5. Update record with workspace member ID

## Notes

- Updated by field shouldn't be changed by users, only by extension 
- Amount of API requests is reduced to possible minimum
