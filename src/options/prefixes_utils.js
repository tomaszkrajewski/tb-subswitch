
function prefixModalAlertShow(alertMessageKey){
    document.getElementById('errorMessage').innerText = alertMessageKey;
    document.getElementById('errorMessage').style.display = 'block';

};

function prefixModalAlertHide(){
    document.getElementById('errorMessage').style.display = 'none';
};


function checkElem(elem, alertMessageKey) {
    var isValid;

    if (elem == null || elem.value.trim() == ""
        //FIXME  com.ktsystems.subswitch.Utils.getRDEntrySplitSign()
        //FIXME com.ktsystems.subswitch.Utils.getRDPrefEntriesSplitSign()
        || elem.value.indexOf("##") > -1
        || elem.value.indexOf("~~") > -1) {
        isValid = false;
    } else {
        isValid = true;
    }

    if (!isValid) {
        prefixModalAlertShow(alertMessageKey);
        elem.focus();
    } else {
        prefixModalAlertHide();
    }

    return isValid;
};

function addItemToListBox(input, where, newValue, duplicateMessageKey) {
    var listbox = document.getElementById(where);

    for (var i = 0; i < listbox.length; i++) {
        if (listbox[i].value.toLowerCase() == newValue.toLowerCase()) {
            prefixModalAlertShow(duplicateMessageKey);
            return;
        }
    }

    let newNode = document.createElement("option");

    // Store the value in the list item as before.
    newNode.value = newValue;
    newNode.innerText = newValue;

    listbox.appendChild(newNode);

    // FIXME nie ma ensureIndexIsVisible
    // listbox.ensureIndexIsVisible(listbox.itemCount - 1);
    input.value = "";

    prefixModalAlertHide();
};


function removeItemFromListBox(where) {
    var listbox = document.getElementById(where);
    var selected = listbox.selectedIndex;

    if (selected >= 0)
        listbox.remove(selected);
};

