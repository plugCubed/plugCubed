module.exports = function() {
    this.requirejs_obfuscate({
        options: {
            dir: './bin/alpha/',
            salt: this.config.requirejs.salt('alpha')
        }
    });
};

