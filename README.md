# Log Monitor

- **[Backend](/backend)**: apollo graphql express server that monitor a list of files (check */log-monitor/backend/src/configs/logFiles.json.EXAMPLE*) and send every new line via its related subscription. It changes the password at every execution, see log for the new generated password.
- **[Frontend](/frontend)**: very simple web page built in svelte that display in real time all the changes coming from the graphql server subscriptions.