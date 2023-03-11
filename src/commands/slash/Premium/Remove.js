const { EmbedBuilder, ApplicationCommandOptionType } = require('discord.js');
const Premium = require("../../../plugins/schemas/premium.js");

module.exports = {
    name: ["premium", "remove"],
    description: "Remove premium from members!",
    category: "Premium",
    owner: true,
    options: [
        {
            name: "target",
            description: "Mention a user want to remove!",
            required: false,
            type: ApplicationCommandOptionType.User,
        },
        {
            name: "id",
            description: "The user id you want to remove!",
            required: false,
            type: ApplicationCommandOptionType.String,
        }
    ],
    run: async (interaction, client, language) => {
        let db

        await interaction.deferReply({ ephemeral: false });
        
        const mentions = interaction.options.getUser("target");

        const id = interaction.options.getString("id");


        if (!id && !mentions) return interaction.editReply({ content: `${client.i18n.get(language, "premium", "remove_no_params",)}` });
        if (id && mentions) return interaction.editReply({ content: `${client.i18n.get(language, "premium", "remove_only_params",)}` });
        if (id && !mentions) db = await Premium.findOne({ Id: id });
        if (mentions && !id) db = await Premium.findOne({ Id:  mentions.id });

        if (!db) return interaction.editReply({ content: `${client.i18n.get(language, "premium", "remove_404", { userid: id })}` })

        if (db.isPremium) {

          db.isPremium = false
          db.premium.redeemedBy = []
          db.premium.redeemedAt = null
          db.premium.expiresAt = null
          db.premium.plan = null

          const done = await db.save().catch(() => {})

          await client.premiums.set(id || mentions.id, done)

            const embed = new EmbedBuilder()
                .setDescription(`${client.i18n.get(language, "premium", "remove_desc", {
                    user: mentions
                })}`)
                .setColor(client.color)

            interaction.editReply({ embeds: [embed] });

        } else {
            const embed = new EmbedBuilder()
                .setDescription(`${client.i18n.get(language, "premium", "remove_already", {
                    user: mentions
                })}`)
                .setColor(client.color)

            interaction.editReply({ embeds: [embed] });
        }
    }
}