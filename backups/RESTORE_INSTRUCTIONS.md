📝 BACKUP RESTORE INSTRUCTIONS

To restore from backup:
1. cd to project root
2. rm -rf src/
3. cp -r backups/[timestamp]_pre_jsx_cleanup/src .
4. npm run dev
