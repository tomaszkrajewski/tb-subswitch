const PREFIX_ROW = `
    <!-- default -->
    <td>
        <input id="prefixDefault-{{id}}" class="form-check-input" type="radio" name="defaultRD">
    </td>
    <!-- name -->
    <td>
        <p id="description-{{id}}" style="font-weight: bold;">{{description}}</p>
    </td>
    <td>
        <p id="prefix-{{id}}">{{prefix}}</p>
    </td>
    <!-- edit -->
    <td>
        <input type="button" class="edit edit_up optionsButton"
                                   value="__MSG_subjects_prefix_switch.label.options.button.edit__" id="edit-{{id}}" />
                                   
    </td>
    <!-- up -->
    <td>
        <input type="button" class="up optionsButton"
                                   value="__MSG_subjects_prefix_switch.label.options.button.up__" id="up-{{id}}" />
                                   
    </td>
    <!-- down -->
    <td>
         <input type="button" class="down optionsButton"
                                   value="__MSG_subjects_prefix_switch.label.options.button.down__" id="down-{{id}}" />
    </td>
    <!-- duplicate -->
    <td>
       <input type="button" class="duplicate optionsButton"
                                   value="__MSG_subjects_prefix_switch.label.options.button.duplicate__" id="duplicate-{{id}}" />
    </td>
    <!-- remove -->
    <td>
        <input type="button" class="delete optionsButton"
                                   value="__MSG_subjects_prefix_switch.label.options.button.delete__" id="delete-{{id}}" />
    </td>
`;

