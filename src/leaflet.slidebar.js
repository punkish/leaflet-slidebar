const Slidebar = L.Control.extend({
    //includes: L.Mixin.Events,
    //includes: L.Evented,
    
    options: {
        content: '<i>Click on a marker for more info</i>',

        // 'full' | 'half' | 'quarter' | 'closed'
        state: 'full',

        threshold: 50,
        doubleThreshold: 200
    },

    initialize: function(options) {
        L.Util.setOptions(this, options);
        
        this.on('swipeup', function(evt) {
            let targetSize;

            if (evt.value > this.options.doubleThreshold) {
                targetSize = 'full';
            } 
            else {
                switch (this._size) {
                    case 'closed':
                        targetSize = 'quarter';
                        break;
                    case 'quarter':
                        targetSize = 'half';
                        break;
                    case 'half':
                        targetSize = 'full';
                        break;
                }
            }

            this.toggleSize(targetSize);
        });

        this.on('swipedown', function(evt) {
            let targetSize;

            if (evt.value > this.options.doubleThreshold) {
                targetSize = 'closed';
            } 
            else {
                switch (this._size) {
                    case 'full':
                        targetSize = 'half';
                        break;
                    case 'half':
                        targetSize = 'quarter';
                        break;
                    case 'quarter':
                        targetSize = 'closed';
                        break;
                }
            }

            this.toggleSize(targetSize);
        });

        return this;
    },

    toggleSize: function(targetSize) {
        const el = document.querySelector('#leaflet-slidebar');

        if (el.classList.contains(targetSize)) {

        }
        else {
            const sizes = [ 'closed', 'quarter', 'half', 'full' ];
            sizes.forEach(s => el.classList.remove(s));
            el.classList.add(targetSize);
            this._size = targetSize;
        }
        
        this.reCenter(this._newCenter);
    },

    onAdd: function(map) {

        // if no container was specified or not found, create it with id and 
        // class 'leaflet-slidebar'
        if (!this._div) {
            this._div = L.DomUtil.create('div', 'leaflet-slidebar');
            this._div.classList.add(this.options.state);
            this._div.id = 'leaflet-slidebar';
            this._size = this.options.state;

            const navClass = '';
            const nav = L.DomUtil.create('nav', navClass, this._div);

            const hrClass = '';
            const hr = L.DomUtil.create('hr', hrClass, nav);
            // L.DomEvent.on(hr, 'click', this.toggleSize, this);

            const btnClass = '';
            const closeBtn = L.DomUtil.create('button', btnClass, nav);
            const toggleClose = (e) => this.toggleSize('closed');
            L.DomEvent.on(closeBtn, 'click', toggleClose, this);
            L.DomEvent.on(closeBtn, 'touchend', toggleClose, this);

            const mainClass = '';
            L.DomUtil.create('main', mainClass, this._div);
        }

        // Note: We return 'this._div' here, not 'this'
        return this._div;
    },

    onRemove: function(map) {

        // nothing to be done
        return this;
    },

/*
                                                                                
        ◀──────────  x   ─────────▶                                             
                                                                     max_x,     
   ▲    ┌─────────────────────────┐     ┌─────────────────────────┐  max_y      
   │    │                         │     │                         │             
   │    │                         │     │                         │             
   │    │           ▲•            │     │                         │             
   │    │           │          o  │     │           ▲•         o ◀┼──  clicked  
   │    │┌──────────┼────────────┐│     │           │             │     marker  
   │    ││          │            ││     │     0.25y │             │             
   │    ││    0.375y│            ││     │           │             │             
   │    ││          │            ││     │┌──────────┼────────────┐│             
   │    ││          ▼x ◀─────────┼┼─────┼┼──────────▼x ──────────┼┼──   center  
        ││                       ││     ││                       ││             
   y    ││                       ││     ││                       ││             
        ││                       ││     ││                       ││             
   │    ││                       ││     ││                       ││             
   │    ││                       ││     ││                       ││             
   │    ││                       ││     ││                       ││             
   │    ││                       ││     ││                       ││             
   │    ││       sliding         ││     ││                       ││             
   │    ││        panel          ││     ││                       ││             
   ▼    └┴───────────────────────┴┘     └┴───────────────────────┴┘             
      min_x,       FULL                           HALF                          
      min_y                                                                     
                                                                                
                                                                                
       ◀──────────  x   ─────────▶                                  max_x,      
                                                                    max_y       
  ▲    ┌─────────────────────────┐      ┌─────────────────────────┐             
  │    │                         │      │                         │             
  │    │                         │      │                         │             
  │    │                         │      │                         │             
  │    │                      o  │      │                      o ◀┼──  clicked  
  │    │                         │      │                         │     marker  
  │    │           ▲•            │      │                         │             
  │    │     0.125y│             │      │                         │             
  │    │           │             │      │                         │             
  │    │           ▼x ◀──────────┼──────┼────────── • ────────────┼──   center  
       │                         │      │                         │             
  y    │                         │      │                         │             
       │                         │      │                         │             
  │    │                         │      │       0y                │             
  │    │┌───────────────────────┐│      │                         │             
  │    ││                       ││      │                         │             
  │    ││                       ││      │                         │             
  │    ││       sliding         ││      │                         │             
  │    ││        panel          ││      │                         │             
  ▼    └┴───────────────────────┴┘      └─────────────────────────┘             
     min_x,    QUARTER                         CLOSED                           
     min_y                                                                      
                                                                                
*/

    reCenter: function() {
        const centerPx = this._map.latLngToLayerPoint(this._newCenter);
        const newCenterPx = [];
        const { min, max } = this._map.getPixelBounds();

        if (document.body.clientWidth < 400) {
            const y = max.y - min.y;
            let delta = 0;
            
            if (this._size === 'full') {
                delta = 0.375;
            }
            else if (this._size === 'half') {
                delta = 0.25;
            }
            else if (this._size === 'quarter') {
                delta = 0.125;
            }

            newCenterPx.push(centerPx.x, centerPx.y + (delta * y));
        }
        else {
            newCenterPx.push(centerPx.x, centerPx.y);
        }

        const newCenter = this._map.layerPointToLatLng(newCenterPx);
        this._map.flyTo(newCenter);
    },

    update: async function({ content, latlng }) {
        const main = this._div.querySelector('#leaflet-slidebar main');
        main.innerHTML = content;
        this._newCenter = latlng;
        this.toggleSize('full');

        return this;
    },

    /**
     * @method addTo(map: Map): this
     * Adds the control to the given map. 
     * Overrides the implementation of L.Control, changing the DOM mount target 
     * from map._controlContainer.topleft to map._container
     */
    addTo: function (map) {
        this.onRemove();
        this._map = map;
        this._container = this.onAdd(map);

        L.DomUtil.addClass(this._container, 'leaflet-slidebar');
 
        if (L.Browser.touch) {
            L.DomUtil.addClass(this._container, 'leaflet-touch');
        }
        
        // when adding to the map container, we should stop event propagation
        L.DomEvent.disableScrollPropagation(this._container);
        L.DomEvent.disableClickPropagation(this._container);

        L.DomEvent.on(
            this._container, 
            'contextmenu', 
            L.DomEvent.stopPropagation
        );

        L.DomEvent.on(
            this._container, 
            'touchstart', 
            this._startSwipe, 
            this
        );

        L.DomEvent.on(
            this._container, 
            'touchend', 
            this._endSwipe, 
            this
        );

        // insert as first child of map container (important for css)
        map._container.insertBefore(this._container, map._container.firstChild);

        // const buttons = document.querySelectorAll('#leaflet-slidebar ul.right button');
        // const that = this;
        // buttons.forEach((button) => {
        //     button.addEventListener('click', function fn(e) {
        //         that.toggleSize(button.name);
        //         const latlng = new L.LatLng(
        //             Number(button.dataset.lat), 
        //             Number(button.dataset.lng)
        //         );
        //         that.reCenter(latlng);
        //     });
        // });

        return this;
    },

    _startSwipe: function(evt) {
        const touch = evt.touches && evt.touches[0];

        if (!touch || !this._map) {
            return;
        }

        if (evt.target && evt.target.tagName == 'A') {
            return;
        }

        this._startPoint = this._map.mouseEventToContainerPoint(touch);
        L.DomEvent.preventDefault(evt);
    },
    
    _endSwipe: function(evt) {
        const touch = evt.changedTouches && evt.changedTouches[0];

        if (!touch || !this._startPoint || !this._map) {
            return;
        }

        const endPoint = this._map.mouseEventToContainerPoint(touch);
        const diff = endPoint.subtract(this._startPoint),
            absX = Math.abs(diff.x),
            absY = Math.abs(diff.y);
        this._startPoint = null;

        if (absX < this.options.threshold && absY < this.options.threshold) {

            // Not enough distance
            return;
        }

        if (absX / absY > 0.5 && absX / absY < 2) {

            // Unclear direction
            return;
        }

        let direction;
        let value;

        if (absX > absY) {
            value = absX;
            direction = diff.x < 0 ? 'left' : 'right';
        } 
        else {
            value = absY;
            direction = diff.y < 0 ? 'up' : 'down';
        }

        this.fire('swipe' + direction, {
            direction,
            value
        });
    }
});

// The proper way to create Evented control
// https://stackoverflow.com/a/49551041/183692
L.extend(Slidebar.prototype, L.Evented.prototype);

export { Slidebar }