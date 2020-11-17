/**
 * App Class
 */
class App {
    /**
     * App constructor.
     */
    constructor() {
        this.components = {};
    }


    /**
     * Used to register a new component.
     *
     * @param name
     * @param component
     * @returns {*}
     */
    component(name, component) {
        // Verify that the component is unique.
        if (this.components.hasOwnProperty(name)) {
            return this.log(
                `Component "${name}" has already been initialized.`
            );
        }

        // Perform the registration.
        this.components[name] = component;

        return this;
    }


    /**
     * Used to initialize the functionality.
     */
    mount() {
        let self = this;

        for (let i in self.components) {
            if (!self.components.hasOwnProperty(i)) {
                continue;
            }

            let component = self.components[i];

            // Verify that this element is a component.
            if (!component instanceof Component) {
                continue;
            }

            // Define the shadow node.
            customElements.define(i, class extends HTMLElement {
                constructor() {
                    super();

                    // Create the shadow component.
                    const attributes = component.getAttributes();
                    const listeners = component.getListeners();
                    const element = this.attachShadow({mode: 'open'});

                    // Bind attributes for reactivity.
                    for (let key in attributes) {
                        if (!attributes.hasOwnProperty(key)) {
                            continue;
                        }

                        Object.defineProperty(component, key, {
                            get: () => {
                                return component.getAttribute(key);
                            },
                            set: (value) => {
                                component.setAttribute(key, value);
                            }
                        });
                    }

                    // Bind event listeners.
                    for (let event in listeners) {
                        if (!listeners.hasOwnProperty(event)) {
                            continue;
                        }

                        element.addEventListener(event, (data) => {
                            component.getEvent(event, data);
                        });
                    }

                    component.setElement(element);
                    component.render();
                }
            });
        }
    }


    /**
     * The system logger.
     *
     * @param message
     * @returns {App}
     */
    log(message) {
        return this;
    }
}

/**
 * Component Class
 */
class Component {
    /**
     * Component constructor.
     */
    constructor() {
        this.index = 0;
        this.element = null;
        this.listeners = {};
        this.attributes = {};
        this.template = (self) => {
            return `<div><slot></slot></div>`;
        };
    }


    /**
     * Used for binding events.
     *
     * @param listeners
     * @returns {Component}
     */
    setListeners(listeners) {
        this.listeners = listeners;

        return this;
    }


    /**
     * Returns the configured event listeners.
     *
     * @returns {{}|*}
     */
    getListeners() {
        return this.listeners;
    }


    /**
     * Used to configure the DOM element.
     *
     * @param element
     * @returns {Component}
     */
    setElement(element) {
        this.element = element;

        return this;
    }


    /**
     * Returns the configured element.
     *
     * @returns {null}
     */
    getElement() {
        return this.element;
    }


    /**
     * Used to configure the template.
     *
     * @param template
     * @returns {Component}
     */
    setTemplate(template) {
        this.template = template;

        return this;
    }


    /**
     * Returns the template.
     *
     * @returns {(function(): string)|*}
     */
    getTemplate() {
        return this.template;
    }


    /**
     * Used to configure the attributes.
     *
     * @param attributes
     * @returns {Component}
     */
    setAttributes(attributes) {
        this.attributes = attributes;

        return this;
    }


    /**
     * Used to configure an attribute.
     *
     * @param key
     * @param value
     * @returns {Component}
     */
    setAttribute(key, value) {
        this.attributes[key] = value;

        if (typeof value !== "function") {
            this.render();
        }

        return this;
    }


    /**
     * Returns the configured attributes.
     *
     * @returns {(function(): {})|*}
     */
    getAttributes() {
        return this.attributes;
    }


    /**
     * Indicates whether or not an attibute has been defined for this instance.
     *
     * @param key
     * @returns {boolean}
     */
    hasAttribute(key) {
        return this.attributes.hasOwnProperty(key);
    }


    /**
     * Used to configure an attribute.
     *
     * @param key
     * @returns {*}
     */
    getAttribute(key) {
        if (!this.attributes.hasOwnProperty(key)) {
            return null;
        }

        const attribute = this.attributes[key];

        return typeof attribute === "function" ?
            attribute(this) : attribute;
    }


    /**
     * Used to handle events.
     *
     * @param event
     * @param data
     */
    getEvent(event, data) {
        let self = this;

        if (data.target && data.target.getAttribute(':bind') && this.hasAttribute(data.target.getAttribute(':bind'))) {
            this[data.target.getAttribute(':bind')] = data.target.value;
        }

        if (!self.listeners.hasOwnProperty(event)) {
            return;
        }

        this.listeners[event](self);
    }


    /**
     * Used to cache an element.
     *
     * @param element
     */
    cache(element) {
        if (!element.children.length) {
            return;
        }

        for (let i = 0; i < element.children.length; i++) {
            element.children[i].setAttribute(':index', this.index);
            this.index++;
            this.cache(element.children[i]);
        }
    }


    /**
     * Performs a re-render on an element.
     *
     * @param element
     */
    update(element) {
        if (!element.children.length) {
            return;
        }

        for (let i = 0; i < element.children.length; i++) {
            element.children[i].setAttribute(':index', this.index);
            let build = this.getElement().querySelector(`[\\:index="${this.index}"]`);
            this.index++;

            if (build && build.innerHTML !== element.children[i].innerHTML) {
                build.innerHTML = element.children[i].innerHTML;
            }

            this.update(element.children[i]);
        }
    }


    /**
     * Used to perform an update on the DOM element.
     */
    render() {
        const element = this.getElement();
        const template = this.getTemplate();

        if (!element || !template) {
            return;
        }

        const compiled = typeof template === "function" ?
            template(this) : template;

        this.index = 0;

        if (!element['__z-mounted__']) {
            element.innerHTML = compiled;
            element['__z-mounted__'] = true;
            this.cache(element);
        }
        else {
            let cache = document.createElement('div');
            cache.innerHTML = compiled;
            this.update(cache);
        }

        // Update the values of bound elements.
        let bound = element.querySelectorAll('[\\:bind]');

        if (bound.length) {
            for (let i = 0; i < bound.length; i++) {
                bound[i].value = this[bound[i].getAttribute(':bind')];
            }
        }

        // Update the values of bound elements.
        let conditions = element.querySelectorAll('[\\:if]');

        if (conditions.length) {
            for (let i = 0; i < conditions.length; i++) {
                let response = Function(`return ${conditions[i].getAttribute(':if')} ? true : false`)();

                if (!response) {
                    conditions[i].remove();
                }
            }
        }
    }
}