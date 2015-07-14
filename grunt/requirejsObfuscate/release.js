module.exports = function() {
    this.requirejs_obfuscate({
        options: {
            dir: './bin/release/',
            salt: this.config.requirejs.salt('release')
        }
    });
};

