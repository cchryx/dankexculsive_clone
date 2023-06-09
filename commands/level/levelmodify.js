const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder, Embed } = require("discord.js");
const { discord_check_role } = require("../../utils/discord");
const { error_reply } = require("../../utils/error");
const { guild_fetch } = require("../../utils/guild");

const { user_level_modify, level_autoroles } = require("../../utils/level");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("levelmodify")
        .setDescription("Check the level of yourself or someone else.")
        .addSubcommand((subcommand) => {
            return subcommand
                .setName("add")
                .setDescription("Add levels to a user.")
                .addUserOption((oi) => {
                    return oi
                        .setName("user")
                        .setDescription("Specify a users")
                        .setRequired(true);
                })
                .addNumberOption((oi) => {
                    return oi
                        .setName("value")
                        .setDescription("Specify a number value.")
                        .setRequired(true);
                });
        })
        .addSubcommand((subcommand) => {
            return subcommand
                .setName("minus")
                .setDescription("Minus levels to a user.")
                .addUserOption((oi) => {
                    return oi
                        .setName("user")
                        .setDescription("Specify a user.")
                        .setRequired(true);
                })
                .addNumberOption((oi) => {
                    return oi
                        .setName("value")
                        .setDescription("Specify a number value.")
                        .setRequired(true);
                });
        })
        .addSubcommand((subcommand) => {
            return subcommand
                .setName("set")
                .setDescription("Set levels to a user.")
                .addUserOption((oi) => {
                    return oi
                        .setName("user")
                        .setDescription("Specify a user.")
                        .setRequired(true);
                })
                .addNumberOption((oi) => {
                    return oi
                        .setName("value")
                        .setDescription("Specify a number value.")
                        .setRequired(true);
                });
        }),
    cooldown: 10,
    async execute(interaction, client) {
        let error_message;
        const guildData = await guild_fetch(interaction.guildId);

        const checkAccess = await discord_check_role(interaction, [
            "965695525213048862",
        ]);
        if (checkAccess === false) {
            error_message = "You don't have the roles to use this command.";
            return error_reply(interaction, error_message);
        }

        const options = {
            user: interaction.options.getMember("user"),
            value: interaction.options.getNumber("value"),
        };

        if (!options.user) {
            error_message = "That user isn't in this server.";
            return error_reply(interaction, error_message);
        }

        const modifiedLevelData = await user_level_modify(
            interaction,
            options.user.user.id,
            interaction.options.getSubcommand(),
            Math.floor(options.value)
        );

        if (Object.keys(guildData.level.roles).length > 0) {
            await level_autoroles(
                options.user,
                guildData.level.roles,
                modifiedLevelData.newLevel
            );
        }

        return interaction.reply({
            content: `${options.user}`,
            embeds: [
                new EmbedBuilder()
                    .setThumbnail(options.user.user.displayAvatarURL())
                    .setTitle(`${options.user.user.tag}`)
                    .setDescription(
                        `**New Level:** \`${modifiedLevelData.newLevel.toLocaleString()}\`\n**Action:** \`${
                            modifiedLevelData.action
                        }\`\n**Value:** \`${modifiedLevelData.value.toLocaleString()}\``
                    ),
            ],
        });
    },
};
