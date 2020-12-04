let configClient = require('./conf')

module.exports = {
    // publicPath: '',
    outputDir: '../public',
    devServer: {
        port: configClient.serverDevPort,
        proxy: {
            '/': {
                target: configClient.server
            }
        }
    }
};