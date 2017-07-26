# discord-reposter
A command-line tool for searching discord archives and resposting messages saved in them.

## Installing
`npm install -g gn0mesort/discord-reposter`

## dscdls
`dscdls` is a tool for reading Discord archives and selecting specific messages to repost. Messages may be filtered based on time, sender, or attachments. To make using `dscdrepost` easier `dscdls` also provides a `--pipe` option which will output data in a format understood by `dscdrepost`.

## dscdrepost
`dscdrepost` is a tool for reposting archived Discord messages. Messages are selected based on their message ID only. Messages are posted with metadata indicating their origins by default but may be stripped of data before posting. `dscdrepost` relies on the `config.json` file in it's root directory by default but the config file may be overridden using the `--config` option or using the `--token`, `--server`, and `--channel` options. To simplify searching for specific messages and reposting them `dscdls` can pipe compatible input into `dscdrepost` in this mode it is not necessary to pass any of the required arguments and they will be ignored in favor of the `dscdls` output.

## config.json
A proper configuration contains the following fields
```json
{
    "token": "<A_DISCORD_USER_TOKEN>",
    "server": "<A_DISCORD_SERVER_ID>",
    "channel": "<A_DISCORD_CHANNEL_ID>"
}
```
`token` represents the user account that will be used in posting messages. This may be a bot account or a regular user account. Bot accounts come with certain special privileges and you may prefer to use one.

`server` is the ID of the server `dscdrepost` should send messages to.

`channel` is the channel on `server` that `dscdrepost` should send messages to.