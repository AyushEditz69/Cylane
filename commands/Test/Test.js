const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const ms = require('pretty-ms');
const GConfig = require("../../plugins/guildConfig.js")

module.exports = {
    name: "test",
    description: "Test command",
    run: async (interaction, client) => {
        await interaction.deferReply({ ephemeral: false });
        const { channel } = interaction.member.voice;
        const player = client.manager.players.get(interaction.guild.id);

        const msg = await interaction.editReply(`Loading...`);
        if (!player) return msg.edit(`I'm not in the voice channel!`)
        if (!channel) return msg.edit(`You need to be in the voice channel!`);
        if (!interaction.guild.members.cache.get(client.user.id).permissions.has(PermissionsBitField.Flags.Connect)) return msg.edit(`I don't have \`CONNECT\` permissions to run this command!`);
        if (!interaction.guild.members.cache.get(client.user.id).permissions.has(PermissionsBitField.Flags.Speak)) return msg.edit(`I don't have \`SPEAK\` permissions to execute this command!`);

        await player.pause(false)
        const embed = new EmbedBuilder()
          .setDescription(`\`🔊\` | **Paused:** \`${channel.name}\`!`)
          .setColor(client.color)

        msg.edit({ content: " ", embeds: [embed] });
    }
};
