(() => {


    document.getElementById("textField").addEventListener("submit", inputHandler);
    /**
     * Adding a checkbox to the site
     * 
     * @param {object} e is an event object
     */
    function inputHandler (e) {
        e.preventDefault();
        const text = document.getElementById("textInput").value;
        addCheckItem(text);
    }

    let i = 0;
    /**
     * Adding a checkbox to the pagelayout
     * max 10 checkboxes may be added
     * 
     * @param {string} text that the checkbox will have
     */
    function addCheckItem (text) {
       if (i > 10) {
            document.getElementById("textInput").disabled = true;
            document.getElementById("textInput").value = "";
        }
        if (i < 10) {
            document.getElementById("textInput").disabled = false;
            const form = document.getElementById("tools");
            const box = document.createElement("input");
            box.type = "checkbox";
            const label = document.createElement("label");
            const labelText = document.createTextNode(text);
            label.htmlFor = box;
            label.appendChild(labelText);
            form.appendChild(box);
            form.appendChild(label);
            const newRow = document.createElement("br");
            form.appendChild(newRow);
            document.getElementById("textInput").value = "";
       }
       i++;
   }
})();