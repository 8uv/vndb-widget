# vndb-widget

- install dependencies:

```bash
bun install
```

- create a .env file in this format:

```env
TOKEN = YOUR_BOT_TOKEN
CLIENT_ID = YOUR_CLIENT_ID
```

- serve bot:

```bash
bun update_commands.ts
bun bot.ts
```

- add your bot via this url: `https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID`
- run /update with your vndb id
- run the following snippet in your discord dev console (created by dziurwa)

```js
let _mods=webpackChunkdiscord_app.push([[Symbol()],{},e=>e.c]);webpackChunkdiscord_app.pop();
let findByProps=(...e)=>{for(let t of Object.values(_mods))try{if(!t.exports||t.exports===window)continue;if(e.every(e=>t.exports?.[e]))return t.exports;for(let r in t.exports)if(e.every(e=>t.exports?.[r]?.[e])&&"IntlMessagesProxy"!==t.exports[r][Symbol.toStringTag])return t.exports[r]}catch{}};

api = findByProps("Bo", "Cu").Bo
async function addWidget(appId) {
    id = findByProps("getCurrentUser").getCurrentUser().id;
    current_widgets = (await api.get("/users/" + id + "/profile")).body.widgets
    if (current_widgets.map(x=>x.data?.application_id).includes(appId)) {return console.log("Already in your widgets — remove it via Discord client to re-add")}
    current_widgets.unshift({"data": {"type": "application","application_id": appId}})
    await api.put({url: "/users/@me/widgets",body:{widgets: current_widgets}})
}
// Usage
addWidget("APPLICATION_ID")
```