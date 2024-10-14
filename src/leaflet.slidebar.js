const Slidebar = L.Control.extend({
    
    options: {
        content: '<i>Click on a marker for more info</i>',
        state: 'full' // 'full' | 'half' | 'quarter' | 'closed'
    },

    initialize: function(options) {
        L.Util.setOptions(this, options);
        return this;
    },

    toggleSize: function(targetSize) {
        const el = document.querySelector('#leaflet-slidebar');
        const sizes = [ 'closed', 'quarter', 'half', 'full' ];
        sizes.forEach(s => el.classList.remove(s));
        el.classList.add(targetSize);
        this._size = targetSize;

        // Create the event
        //const event = new CustomEvent("sizeToggled", { "detail": "Info window size was toggled" });

        // Dispatch/Trigger/Fire the event
        //this.dispatchEvent(event);
        //this.fire("sizeToggled")
    },

    makeSlidebarHtml: function() {
        const html = `
                <nav>
                    <ul class="right">
                        <li><button name="full" title="maximize the info window" data-lat="" data-lng="">&#9633;</button></li>
                        <li><button name="half" title="set info window to half size" data-lat="" data-lng="">&lrtri;</button></li>
                        <li><button name="quarter" title="set info window to a quarter size" data-lat="" data-lng="">&mdash;</button></li>
                        <li><button name="closed" title="close the info window" data-lat="" data-lng="">&times;</button></li>
                    </ul>
                </nav>
                
                <main></main>`;
;
        return html
    },

    onAdd: function(map) {

        // if no container was specified or not found, create it with id and 
        // class 'leaflet-slidebar'
        if (!this._div) {
            this._div = L.DomUtil.create('div', 'leaflet-slidebar');
            this._div.classList.add(this.options.state);
            this._div.id = 'leaflet-slidebar';
            this._size = this.options.state;
            this._div.innerHTML = this.makeSlidebarHtml();
        }

        // Note: We return this._div here, not this
        return this._div;
    },

    onRemove: function(map) {
        return this;
    },

    // open: function(map) {

    //     // Open sidebar if it's closed
    //     if (L.DomUtil.hasClass(this._div, 'closed')) {
    //         this.fire('opening');
    //         L.DomUtil.removeClass(this._div, 'closed');
    //         L.DomUtil.addClass(this._div, 'full');
    //     }

    //     return this;
    // },

/*
                                                                                                                                         
                                                                                                                                                  
       ◀──────────  x   ─────────▶                                                                                                 max_x,         
                                                                                                                                   max_y          
  ▲    ┌─────────────────────────┐     ┌─────────────────────────┐     ┌─────────────────────────┐     ┌─────────────────────────┐                
  │    │                         │     │                         │     │                         │     │                         │                
  │    │                         │     │                         │     │                         │     │                         │                
  │    │           ▲•            │     │                         │     │                         │     │                         │                
  │    │           │          o  │     │           ▲•         o  │     │                      o  │     │                      o ◀┼─────  clicked  
  │    │┌──────────┼────────────┐│     │           │             │     │                         │     │                         │        marker  
  │    ││          │            ││     │     0.25y │             │     │           ▲•            │     │                         │                
  │    ││    0.375y│            ││     │           │             │     │     0.125y│             │     │                         │                
  │    ││          │            ││     │┌──────────┼────────────┐│     │           │             │     │                         │                
  │    ││          ▼x ◀─────────┼┼─────┼┼──────────▼x ──────────┼┼─────┼───────────▼x ───────────┼─────┼─────────── • ───────────┼─────   center  
       ││                       ││     ││                       ││     │                         │     │                         │                
  y    ││                       ││     ││                       ││     │                         │     │                         │                
       ││                       ││     ││                       ││     │                         │     │                         │                
  │    ││                       ││     ││                       ││     │                         │     │        0y               │                
  │    ││                       ││     ││                       ││     │┌───────────────────────┐│     │                         │                
  │    ││                       ││     ││                       ││     ││                       ││     │                         │                
  │    ││       sliding         ││     ││                       ││     ││                       ││     │                         │                
  │    ││        panel          ││     ││                       ││     ││                       ││     │                         │                
  │    ││                       ││     ││                       ││     ││                       ││     │                         │                
  ▼    └┴───────────────────────┴┘     └┴───────────────────────┴┘     └┴───────────────────────┴┘     └─────────────────────────┘                
     min_x,                                                                                                                                       
     min_y                                                                                                                                        
                                                                                                                                                                                                                                                                                                                                                                                                                     
                                                                                                                                         
*/

    reCenter: function(coords) {
        const centerPx = this._map.latLngToLayerPoint(coords);
        const newCenterPx = [];

        if (document.body.clientWidth < 400) {
            const { min, max } = this._map.getPixelBounds();
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
            const { min, max } = this._map.getPixelBounds();
            const x = max.x - min.x;
            let delta = ((x - 350) / 2) - 40;
            newCenterPx.push(centerPx.x + delta, centerPx.y);
        }

        const newCenter = this._map.layerPointToLatLng(newCenterPx);
        this._map.flyTo(newCenter);
        
    },

    update: async function({ content, coords }) {
        //this._div.innerHTML = content;
        const main = this._div.querySelector('#leaflet-slidebar main');
        main.innerHTML = content;

        if (this._size === 'closed') {
            this.toggleSize('full');
        }
        
        this.reCenter(coords);

        const buttons = document.querySelectorAll('#leaflet-slidebar ul.right button');
        buttons.forEach((button) => {
            button.dataset.lat = coords[0];
            button.dataset.lng = coords[1];
        });

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
        L.DomUtil.addClass(this._container, 'open');

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

        // insert as first child of map container (important for css)
        map._container.insertBefore(this._container, map._container.firstChild);

        
        const buttons = document.querySelectorAll('#leaflet-slidebar ul.right button');
        const that = this;
        buttons.forEach((button) => {
            button.addEventListener('click', function fn(e) {
                that.toggleSize(button.name);
                const coords = [
                    Number(button.dataset.lat), 
                    Number(button.dataset.lng)
                ];
                that.reCenter(coords);
            });
        });

        return this;
    },
});

export { Slidebar }