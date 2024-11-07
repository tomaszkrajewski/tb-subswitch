const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PREFIX_ROW = `
    <!-- default -->
    <td>
        <input id="prefixDefault-{{id}}" class="w3-radio" type="radio" name="defaultRD">
    </td>
    <!-- name -->
    <td>
        <span id="description-{{id}}" style="font-weight: bold;">{{description}}</span>
    </td>
    <td>
        <span id="prefix-{{id}}">{{prefix}}</span>
    </td>
    <td>
        <input id="showInNewMsgPopup-{{id}}" class="w3-check" type="checkbox" 
            {{#showInNewMsgPopup}} 
                checked="true" 
            {{/showInNewMsgPopup}} 
        />
    </td>
    <!-- edit -->
    <td>
        <input type="button" class="w3-button w3-blue" 
                                   value="__MSG_subjects_prefix_switch.label.options.button.edit__" id="edit-{{id}}" />                                
    <!-- up -->
        <input type="button" class="w3-button w3-cyan"
                                   value="&uarr;" id="up-{{id}}" />
    <!-- down -->
         <input type="button" class="w3-button w3-cyan"
                                   value="&darr;" id="down-{{id}}" />
    <!-- duplicate -->
       <input type="button" class="w3-button w3-green"
                                   value="__MSG_subjects_prefix_switch.label.options.button.duplicate__" id="duplicate-{{id}}" />
    <!-- remove -->
        <input type="button" class="w3-button w3-red"
                                   value="__MSG_subjects_prefix_switch.label.options.button.delete__" id="delete-{{id}}" />
    </td>
`;

const ALERT_TEMPLATE = `
    <div class="w3-panel w3-yellow w3-padding-small" style="margin-top: 0px; margin-bottom: 0px;">
        <p>{{message}}</p>
        <div class="w3-center w3-margin-top w3-margin-bottom">
            <input type="button" class="w3-button w3-red" id="button1" value="{{button1Label}}" />
            {{#button2Label}} 
                <input type="button" class="w3-button w3-green" id="button2" value="{{button2Label}}" /> 
            {{/button2Label}} 
        </div>
    </div>
`;

const PREFIX_EDIT_TEMPLATE = `
   <div class="w3-panel w3-grey w3-padding-small" style="margin-top: 0px; margin-bottom: 0px;">
        <p>{{message}}</p>
    </div>
    <div class="w3-container w3-yellow" id="errorMessage">Operation not valid. Please check your inputs.</div>
    <div class="w3-margin">
        <div class="w3-padding-16">
            <label for="description">__MSG_subjects_prefix_switch.label.setrd.description__</label>
            <input class="w3-input"  id="description" type="text" value="{{item.description}}"/>
        </div>
        <div class="w3-padding-16">
            <label for="prefix">__MSG_subjects_prefix_switch.label.setrd.path__</label>
            <input class="w3-input" id="prefix" type="text" value="{{item.prefix}}"/>
        </div>
    </div>
    
    <div class="w3-margin">
        <fieldset class="w3-border w3-section">
            <legend class="w3-border w3-padding">__MSG_subjects_prefix_switch.label.setrd.aliases__</legend>
            <input class="w3-input" id="alias" type="text"/>
            <div class="w3-center w3-margin-top">
                 <button type="button" class="w3-button w3-blue" id="addAlias">
                    <i class="fas fa-plus"> __MSG_subjects_prefix_switch.label.setrd.aliasesAdd__</i>
                 </button>
                 <button type="button" class="w3-button w3-red" id="removeAlias">
                    <i class="fas fa-minus"> __MSG_subjects_prefix_switch.label.setrd.aliasesRemove__</i>
                 </button>
             </div>
             <select class="w3-select w3-border" style="width: 100%; margin-top: 8px;" id="aliasesList" size="4">
                {{#item.aliasesList}}
                <option value="{{.}}"><label value="{{.}}" />{{.}}</option>
                {{/item.aliasesList}}
             </select>
        </fieldset>

        <fieldset class="w3-border w3-section">
            <legend class="w3-border w3-padding">__MSG_subjects_prefix_switch.label.setrd.addresses__</legend>
            <div class="w3-row">
                <div class="w3-col s4">
                    <label for="addressType">Address Type</label>
                    <select class="w3-select" id="addressType">
                        <option value="To:" label="TO">To</option>
                        <option value="CC:" label="CC" selected="true">CC</option>
                        <option value="BCC:" label="BCC">BCC</option>
                    </select>
                </div>
                <div class="w3-col s8">
                    <label for="address">Address</label>
                    <input class="w3-input" id="address" type="email" placeholder="Enter address">
                </div>
            </div>
            <div class="w3-center w3-margin-top">
                 <button type="button" class="w3-button w3-blue" id="addAddress">
                    <i class="fas fa-plus"> __MSG_subjects_prefix_switch.label.setrd.addressesAdd__</i>
                 </button>
                 <button type="button" class="w3-button w3-red" id="removeAddress">
                    <i class="fas fa-minus"> __MSG_subjects_prefix_switch.label.setrd.addressesRemove__</i>
                 </button>
             </div>
             <select class="w3-select w3-border" style="width: 100%; margin-top: 8px;" id="addressList" size="4">
                {{#item.addressesList}}
                <option value="{{.}}"><label value="{{.}}" />{{.}}</option>
                {{/item.addressesList}}
             </select>
        </fieldset>
        
        <fieldset class="w3-border w3-section">
            <legend class="w3-border w3-padding">__MSG_subjects_prefix_switch.label.options.othertab__</legend>
            <table class="w3-table w3-bordered">
                 <tbody>
                     <tr>
                        <td class="w3-padding-16">
                            <label for="rdSequenceValue">__MSG_subjects_prefix_switch.label.setrd.sequence__</label>
                            <input class="w3-input"  id="rdSequenceValue" type="number" value="{{item.currentSeqValue}}" min="0" max="9999999999"/>
                        </td>
                    </tr>
                </tbody>
            </table>
        </fieldset>
        
        <div class="w3-center w3-margin-top w3-section">
            <input type="button" class="w3-button w3-green" id="button1" value="{{button1Label}}" />
            <input type="button" class="w3-button w3-grey" id="button2" value="{{button2Label}}" /> 
        </div>  
    </div>
`;