module.exports = {
    aws: {
        accessKeyId: '',
        secretAccessKey: ''
    },
    debug: false,
    paths: {
        chromePath: '',
        plugDeobfuscation: ''    },
    requirejs: {
        salt: function(type) {
            return type;
        }
    }
};
