# Zephyr Framework
A super lightweight component / reactivity framework built for prototyping.

### Basic Usage
To begin using the framework, simply include the source within the body of your page.

```html
<script type="text/javascript" src="zephyr.js"></script>
```

You can now begin defining your new components as appropriate, and then finalize the registration by mounting them within your dynamic application.
```javascript
new App().component('z-example', (new Component())
    .setTemplate((self) => {
        return `
            <div>
                <label>Please enter a number.</label>
                <input :bind="first" type="number"/>
            </div>
            <div>
                <label>Please enter another number</label>
                <input :bind="second" type="number"/>
            </div>
            <b>The sum is: ${self.sum}</b>`
    }).setAttributes({
        first: 1,
        second: 0,
        sum(self) {
            return parseInt(self.first) + parseInt(self.second);
        }
    }).setListeners({
        input(self){

        }
    })
).mount();
```

After registered, you can use your new component within your webpage.
```html
<z-example></z-example>
```
