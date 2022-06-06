appName=$1

# npm run build

# @TODO: uncomment after fix backup.py
# backup.py does not import build files correctly
#DB_BUILD_PATH="database/Package/$appName"
#echo "Copying build to $DB_BUILD_PATH"
#mkdir -p $DB_BUILD_PATH
#cp -r build/. $DB_BUILD_PATH

# @TODO: 
#    - load language file into package
#    currently, the configuration file provides a better editing solution
#DB_LOCALES_PATH="database/Package/locales$appName"
#echo "Copying i18n files to $DB_LOCALES_PATH"
#mkdir -p $DB_LOCALES_PATH
#cp -r src/i18n/locales/. $DB_LOCALES_PATH

echo "Importing database $appName"
python3 -m tools.backup -a import -p database -r "./"

# @TODO: remove after fix backu.py
# backup.py does not import build files correctly
echo "Importing application $appName"
python3 -m tools.upload_ui -p $appName -f build

python3 -m tools.deployApp -k movai