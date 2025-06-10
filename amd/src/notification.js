/**
 * Javascript containing function of the admin entities
 */

define([
    'jquery',
    'jqueryui',
    'local_mentor_core/mentor',
    'format_edadmin/format_edadmin',
    'core/templates',
    'core/str'
], function ($, ui, mentor, format_edadmin, templates, str) {
    return  {
        
        init : function()
        { 
               $("#madal_params").hide();
               $(document).ready(function() {
                    $(document).on("keydown.DT", '[type="checkbox"]', function(e) {
                        if (e.key === 'Tab') {                       
                                $(this).focus();                        
                        }
                    });
                });
             
                this.clickOnToggle();
                this.KeyPressOnToggle();                
                this.initNotificationModalEvent();
                const handler = this.fetchData.bind(this);
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', handler);
                } else {
                    handler();
                }  
                
        },

        clickOnToggle: function()
        {  

            var that = this ;
            
            $(document).ready(function() {
            //Click to check/uncheck on one toggle
            $(document).on("click", '[id^="collection-"]', function(e) {
                //if 'checkAll' toggle is on, and one toggle is clicked to uncheck then we should set 'checkAll' toggle to false 
                document.getElementById('check_all').checked = that.isAllChecked();               
                
                var data = [];
                //send data to notify/unNotify user
                data = [{
                    "id":  this.value,
                "notify":  this.checked
                 }];
                    that.sendData(data);
              
            });

              //send data when click to check/uncheck ALL
              $('#check_all').on("click",function (e) {
                 //Check and uncheck all toggles on click/keypress
                that.functionCheckAll();
                var data = [];
                $('[id^="collection-"]').each(function(index) {
               
                    // Ensure the element has both value and checked attributes
                    if (this.value !== undefined && this.checked !== undefined) {
                        data[index] = {
                            "id": this.value,
                            "notify": this.checked
                        };
                    }
                });
                that.sendData(data);
            });
            })
        },
        //Check and uncheck all toggles on click/keypress
        async functionCheckAll() {
            const promises = $('.toggle_collections').each(function() {
                this.checked = document.getElementById('check_all').checked;                        
            });
            await Promise.all(promises);
            
          },
          
          

        KeyPressOnToggle: function()
        {  
             var that = this ;
           
            $(document).ready(function() {

                // Check/Uncheck on Enter key
                $(document).on("keypress.DT", '[type="checkbox"]', function(e) {
                    if ( e.keyCode == 13 ) {
                        this.checked= !this.checked ; 
                    }
                } );

              // On Enter key.
              $(document).on("keypress.DT", '[id^="collection-"]', function() {

                    //if 'checkAll' toggle is on, and one toggle is clicked to uncheck then we should set 'checkAll' toggle to false 
                    document.getElementById('check_all').checked = that.isAllChecked();      
                    
                    var data = [];
                    //send data to notify/unNotify user
                    data = [{
                        "id":  this.value,
                    "notify":  this.checked
                     }]
                    that.sendData(data);
                });
            

  
             //send data when click to check/uncheck ALL
             $(document).on("keypress.DT", '[id="check_all"]', function() {
                    //Check and uncheck all toggles on click/keypress
                    that.functionCheckAll();
                    var data = [];
                    $('[id^="collection-"]').each(function(index) {                       
                        // Ensure the element has both value and checked attributes
                        if (this.value !== undefined && this.checked !== undefined) {
                            data[index] = {
                                "id": this.value,
                                "notify": this.checked
                            };
                        }
                    });
                    //Send Data to ajax call
                    that.sendData(data);
            });
            });
        },

        //Get data from controller and fetch it on modal's table
        fetchData: function()
        {
           var that = this;
           const ajaxInput = document.getElementById("ajax_file_path");
           const controllerInput = document.getElementById("controller_get");
           const actionInput = document.getElementById("function_get");
         
           if (!ajaxInput || !controllerInput || !actionInput) {
             console.error("❌ One or more required elements not found in DOM.");
             return;
           }
            format_edadmin.ajax_call({
                url: M.cfg.wwwroot + document.getElementById("ajax_file_path").value,
                controller: document.getElementById("controller_get").value,
                action:  document.getElementById("function_get").value,
                format: 'json',
                callback: function (response) {

                    response = JSON.parse(response);

                    if (!response.success) {
                        return;
                    }

                    var responseData = response.message;
                    if (responseData) {
                        var output ='';
                        $.each(responseData, function (index,record) {
                            output += `
                                    <tr>
                                    <td>${record.fullname}</td>
                                    <td>
                                        <div class="fr-toggle fr-toggle--border-bottom">
                                            <input value ="${record.id}" type="checkbox" class="fr-toggle__input toggle_collections" aria-describedby="collection-1-hint-text toggle-hint-0-messages" id="collection-${record.id}" aria-label="${record.fullname}">
                                            <label class="fr-toggle__label" for="collection-${record.id}" data-fr-checked-label="Activé" data-fr-unchecked-label="Désactivé"></label>
                                            <div class="fr-messages-group" id="-messages-${record.id}" aria-live="polite">
                                            </div>
                                        </div>
                                        </td>
                                    </tr>                             
                                
                                    `; 
                        });
                        $('#collectionsList').html(output);
                     }

                     that.setUserPreferences();
                }
            });


        },
        //Init notification modal.
        initNotificationModalEvent: function () {
            var that = this;
            // Trigger click event to open the notification modal.
            $('#notification_button').click(function (e) {                 
                    // Create lodal.
                    mentor.dialog("#notification_modal"
                       ,
                        {
                            width: 'auto',
                            left: '25%',
                            top: '5%',
                            title:  M.util.get_string('subscription_management', 'theme_mentor'),
                            buttons: [],
                            position: { my: "center" },
                            close: function () {
                                $(this).dialog("destroy");
                            },
                               
                        });
                        $(".ui-dialog-title").append('<img src="'+M.cfg.wwwroot+'/theme/mentor/pix/vector.svg" class="icon notification_icon"  />');
                        $('.ui-dialog-titlebar-close').attr('aria-label','Fermer');
                        var disableModal = document.getElementById('notification_modal').getAttribute('data-disable_modal');
                        if(disableModal == 1)
                        {
                         document.getElementById('check_all').checked = true ;
                         document.getElementById('check_all').disabled = true;
                         $('.toggle_collections').each(function() {
                             this.checked = true;
                             this.disabled = true;                        
                         });
                        }else{
                            document.getElementById('check_all').disabled = false;
                            $('.toggle_collections').each(function() {
                                this.disabled = false;                        
                            });
                              that.setUserPreferences();
                        }
         
                      
                    return;          

            });
        },

        //Check if all toggles are checked/unchecked
        isAllChecked: function()
        {
            return $('[id^="collection-"]').length === $('[id^="collection-"]:checked').length;
        },

        //Ajax call to send data
        sendData: function(data)
        {
            format_edadmin.ajax_call({
                url: M.cfg.wwwroot + document.getElementById("ajax_file_path").value,
                controller:  document.getElementById("controller_send").value,
                action:  document.getElementById("function_send").value,
                type: document.getElementById("type").value,
                format: 'json',
                notifications: JSON.stringify(data),
                callback: function (response) {
                    
                }
            });
           
        },
        //Set user preferences on toggles
        setUserPreferences: function()
        { 
            var that = this;
            format_edadmin.ajax_call({
                url: M.cfg.wwwroot + document.getElementById("ajax_file_path").value,
                controller: document.getElementById("controller_get_preferences").value,
                action:  document.getElementById("function_get_preferences").value,
                format: 'json',
                type: document.getElementById("type").value,
                callback: function (response) {

                    response = JSON.parse(response);

                    if (!response.success) {
                        return;                    }

                    var responseData = response.message;

                    if (responseData) {
                        var output ='';
                        $.each(responseData, function (index,record) {
                            if(document.getElementById(`collection-${record.collection_id}`))
                            {
                                document.getElementById(`collection-${record.collection_id}`).checked = true;
                            }else{
                                document.getElementById(`collection-${record.collection_id}`).checked = false;
                            }
                            
                        });

                        //check if all toggle are true , then the toggle "select all" should be on too
                        document.getElementById('check_all').checked = that.isAllChecked();  
                     }
                }
            });


        }
    }

});

