const { Client, GatewayIntentBits, Collection } = require("discord.js");
const Discord = require('discord.js');
const { Connectors } = require("shoukaku");
const { Kazagumo, KazagumoTrack, Plugins } = require("kazagumo");
const logger = require('../../plugins/logger')
const { I18n } = require("@hammerhq/localization")
const Spotify = require('kazagumo-spotify');
const Cluster = require('discord-hybrid-sharding');
const Deezer = require('kazagumo-deezer');
const Nico = require('kazagumo-nico');
const delay = require('delay')
const WebSocket = require('ws')

class Manager extends Client {
    constructor() {
        super({
            shards: Cluster.data.SHARD_LIST,
            shardCount: Cluster.data.TOTAL_SHARDS,
            allowedMentions: {
                parse: ["roles", "users", "everyone"],
                repliedUser: false
            },
            intents: require("../../plugins/config.js").ENABLE_MESSAGE ? [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
            ] : [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildMessages,
            ]
        });

    this.config = require("../../plugins/config.js");
    
    if (this.config.WEBSOCKET){
        logger.error("You cannot enable this feature on advanced shard system! To use ws, please run the bot in normal mode by type `npm run start:normal` or `npm start`\n To disable, use <feature_name>: false in application.yml files")
        process.exit()
    }

    this.owner = this.config.OWNER_ID;
    this.dev = this.config.DEV_ID;
    this.color = this.config.EMBED_COLOR;
    if(!this.token) this.token = this.config.TOKEN;
    this.i18n = new I18n(this.config.LANGUAGE);
    this.logger = logger
    this.prefix = this.config.PREFIX

    process.on('unhandledRejection', error => this.logger.log({ level: 'error', message: error }))
    process.on('uncaughtException', error => this.logger.log({ level: 'error', message: error }))

    this.manager = new Kazagumo({
        defaultSearchEngine: "youtube", 
        // MAKE SURE YOU HAVE THIS
        send: (guildId, payload) => {
            const guild = this.guilds.cache.get(guildId);
            if (guild) guild.shard.send(payload);
        },
        plugins: [
            new Spotify({
              clientId: this.config.SPOTIFY_ID,
              clientSecret: this.config.SPOTIFY_SECRET,
              playlistPageLimit: 1, // optional ( 100 tracks per page )
              albumPageLimit: 1, // optional ( 50 tracks per page )
              searchLimit: 10, // optional ( track search limit. Max 50 )
              searchMarket: 'US', // optional || default: US ( Enter the country you live in. [ Can only be of 2 letters. For eg: US, IN, EN ] )//
            }),
            new Deezer(),
            new Nico({ searchLimit: 10 }),
            new Plugins.PlayerMoved(this)
          ],
    }, new Connectors.DiscordJS(this), this.config.NODES, this.config.SHOUKAKU_OPTIONS);

    const loadCollection = [
        "slash", 
        "commands", 
        "premiums", 
        "interval", 
        "sent_queue", 
        "aliases",
        "pl_editing"
    ]

    if (!this.config.ENABLE_MESSAGE) loadCollection.splice(loadCollection.indexOf('commands'), 1);
    
    loadCollection.forEach(x => this[x] = new Collection());
    
    [
        "loadCommand",
        "loadEvent",
        "loadDatabase",
        "loadNodeEvents",
        "loadPlayer",
        "prefix_command",
    ].forEach(x => require(`../../handlers/${x}`)(this));

    this.cluster = new Cluster.Client(this);

    const client = this;

	}
		
    connect() {
        return super.login(this.token);
    };
};

module.exports = Manager;