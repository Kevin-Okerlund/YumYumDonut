;(function () {

    function createSVG(width, height) {
        var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        var transX = width / 2;
        var transY = height / 2;
        g.setAttribute('transform', 'translate(' + transX + ',' + transY + ') rotate(-90)');

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
        svg.setAttribute('version', '1.1');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.appendChild(g);
        return svg;
    }

    function forEach(obj, callback) {
        var results = [];
        for (var i = 0; i < obj.length; i++) {
            results.push(callback.call(obj, obj[i], i));
        }
        return results;
    }

    function polarToCartesian(radius, angleInDegrees) {
        var angleInRadians = angleInDegrees * Math.PI / 180.0;
        return {
            x: radius * Math.cos(angleInRadians),
            y: radius * Math.sin(angleInRadians)
        };
    }

    var DATA_NAME = '__YUM__';

    function YumYumDonut(parent, data, options) {
        this.parent = document.querySelector(parent);
        this.data = data;
        this.options = options;
        this.setOptions(options);

        this.svg = createSVG(this.options.width, this.options.height);
        this.g = this.svg.getElementsByTagName('g')[0];

        this.parent.appendChild(this.svg);

        this.setData();
        this.drawArcs();
    }

    YumYumDonut.prototype.setOptions = function(options) {
        var total = 0;

        this.options.width = options.width || 300;
        this.options.height = options.height || 150;
        this.options.total = options.total || forEach(this.data, function (item) {
            return total += item.amount;
        }).pop();
        this.options.arcPadding = options.arcPadding || 0;
        this.options.outerRadius = options.outerRadius || 0;
        this.options.innerRadius = options.innerRadius || 0;
        return this;
    };

    YumYumDonut.prototype.setData = function() {
        var self = this;
        var rotate = 0;
        forEach(self.data, function(item, index) {
            var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('fill', item.color);

            self.data[index][DATA_NAME] = {
                degrees: ((item.amount / self.options.total) * 360) - (self.options.arcPadding / 2),
                rotate: rotate + (self.options.arcPadding / 2 / 2),
                path: path
            };

            rotate += (item.amount / self.options.total) * 360;

            self.g.appendChild(path);
        });
    };

    YumYumDonut.prototype.drawArcs = function() {
        var self = this;

        forEach(self.data, function(item) {
            var largeSweep = false;
            if (item[DATA_NAME].degrees > 180) {
                largeSweep = true;
            }
            // rx, ry, x-axis-rotation, large-arc-flag, sweep-flag, x, y

            var opt = self.options;

            var outerArcTo = polarToCartesian(opt.outerRadius, item[DATA_NAME].degrees);
            var outerArc = ['A', opt.outerRadius, opt.outerRadius, 0, +largeSweep, 1, outerArcTo.x, outerArcTo.y].join(' ');

            var innerArcTo = polarToCartesian(opt.innerRadius, item[DATA_NAME].degrees);
            var innerArc = ['A', opt.innerRadius, opt.innerRadius, 0, +largeSweep, 0, opt.innerRadius, 0].join(' ');

            var arcString = ['M', opt.outerRadius, 0, outerArc, 'L', innerArcTo.x, innerArcTo.y, innerArc, 'Z'].join(' ');

            item[DATA_NAME].path.setAttribute('d', arcString);
            item[DATA_NAME].path.setAttribute('transform', 'rotate(' + item[DATA_NAME].rotate + ')');
        });
    };

    return window.YumYumDonut = YumYumDonut;

})();
