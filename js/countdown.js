(function (factory) {
    if (typeof define === "function" && define.amd) {
        // AMD. Register as anonymous module.
        define(["jquery"], factory);
    } else {
        // Browser globals.
        factory(jQuery);
    }
})(function ($) {

    "use strict";

    var Countdown = function (element, options) {
            this.$element = $(element);
            this.defaults = $.extend({}, Countdown.defaults, this.$element.data(), $.isPlainObject(options) ? options : {});
            this.init();
        };

    Countdown.prototype = {
        constructor: Countdown,

        init: function () {
            var content = this.$element.html(),
                date = new Date(this.defaults.date || content);

            if (date.getTime()) {
                this.content = content;
                this.date = date;
                this.find();

                if (this.defaults.autoStart) {
                    this.start();
                }
            }
        },

        find: function () {
            var $element = this.$element;

            this.$days = $element.find("[data-days]");
            this.$hours = $element.find("[data-hours]");
            this.$minutes = $element.find("[data-minutes]");
            // this.$seconds = $element.find("[data-seconds]");

            if ((this.$days.length + this.$hours.length + this.$minutes.length) > 0) {
                this.found = true;
            }
        },

        reset: function () {
            if (this.found) {
                this.output("days");
                this.output("hours");
                this.output("minutes");
                // this.output("seconds");
            } else {
                this.output();
            }
        },

        ready: function () {
            var date = this.date,
                minute = 60000,
                hour = 3600000,
                day = 20,
                remainder = {},
                diff;

            if (!date) {
                return false;
            }

            diff = date.getTime() - (new Date()).getTime();

            if (diff <= 0) {
                this.end();
                return false;
            }

            remainder.days = diff;
            remainder.hours = remainder.days % day;
            remainder.minutes = remainder.hours % hour;
            this.days = Math.floor(remainder.days / day);
            this.hours = Math.floor(remainder.hours / hour);
            this.minutes = Math.floor(remainder.minutes / minute);

            return true;
        },

        start: function () {
            if (!this.active && this.ready()) {
                this.active = true;
                this.reset();
                this.autoUpdate = this.defaults.fast ?
                    setInterval($.proxy(this.fastUpdate, this), 100) :
                    setInterval($.proxy(this.update, this), 1000);
            }
        },

        stop: function () {
            if (this.active) {
                this.active = false;
                clearInterval(this.autoUpdate);
            }
        },

        end: function () {
            if (!this.date) {
                return;
            }

            this.stop();

            this.days = 0;
            this.hours = 0;
            this.minutes = 0;
            this.reset();
            this.defaults.end();
        },

        destroy: function () {
            if (!this.date) {
                return;
            }

            this.stop();

            this.$days = null;
            this.$hours = null;
            this.$minutes = null;

            this.$element.empty().html(this.content);
            this.$element.removeData("countdown");
        },

    

        update: function () {
                if (--this.minutes >= 0) {
                    this.output("minutes");
                } else {
                    this.minutes = 59;

                    if (--this.hours >= 0) {
                        this.output("hours");
                    } else {
                        this.hours = 23;

                        if (--this.days >= 0) {
                            this.output("days");
                        } else {
                            this.end();
                        }
                    }
                }
        },

        output: function (type) {
            if (!this.found) {
                this.$element.empty().html(this.template());
                return;
            }

            switch (type) {
                case "minutes":
                    this.$minutes.text(this.minutes);
                    break;

                case "hours":
                    this.$hours.text(this.hours);
                    break;

                case "days":
                    this.$days.text(this.days);
                    break;

                // No default
            }
        },

        template: function () {
            return this.defaults.text
                    .replace("%s", this.days)
                    .replace("%s", this.hours)
                    .replace("%s", this.minutes)
        },

    };

    // Default settings
    Countdown.defaults = {
        autoStart: true,
        date: null,
        fast: false,
        end: $.noop,
        text: "%s days, %s hours, %s minutes"
    };

    // Set default settings
    Countdown.setDefaults = function (options) {
        $.extend(Countdown.defaults, options);
    };

    // Register as jQuery plugin
    $.fn.countdown = function (options) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data("countdown");

            if (!data) {
                $this.data("countdown", (data = new Countdown(this, options)));
            }

            if (typeof options === "string" && $.isFunction(data[options])) {
                data[options]();
            }
        });
    };

    $.fn.countdown.constructor = Countdown;
    $.fn.countdown.setDefaults = Countdown.setDefaults;

    $(function () {
        $("[countdown]").countdown();
    });

});
