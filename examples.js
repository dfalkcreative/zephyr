new App().component('z-example', (new Component())
    .setTemplate((self) => {
        return `<div>
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