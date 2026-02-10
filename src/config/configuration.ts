export default () => ({
    database: { url: process.env.DATABASE_URL, },
    jwt: {
        secret: process.env.JWT_SECRET,
        refreshSecret: process.env.JWT_REFRESH_SECRET,
    },
});