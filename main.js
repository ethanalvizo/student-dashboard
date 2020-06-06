geotab.addin.maintenance = function (api, state) {

//============================== Main Code Here =====================================

    //populates the entire upcoming interface upon  being loaded
    var populateUpcomingInterface = function () {
        updateDatabase(); 
        populateOverdueCards();
        populateUpcomingCards();
        generateUpcomingTable();
        generateHistoryTable();
    }

    //Pulls all the data from the Go devices and then update the Addin DB Objects 
    var updateDatabase = function() {
    var goResults = [];
    var objResults = []; 
    
    api.call("Get", {
        "typeName": "Device"
    }, function(goResults) {
        console.log("Done: ", goResults);
        
         api.call("Get",
            {
              "typeName": "AddInData",
              "search": {
                  "addInId": "asTJLQJnQeEurmmJe6pqcAw"
              }
            }, function(objResults) {
                console.log("Objects: ", objResults);
                
                for (var i = 0; i < goResults.length; i++) {
                    var newObj = true; 
                    for (var k = 0; k < objResults.length; k++) {
                        
                        var obj = JSON.parse(objResults[k].data);
                        
                        if(typeof obj.vehicle !== 'undefined'){
                            console.log(i, k, goResults[i].serialNumber, obj.vehicle.GoSerialNumber);
                            
                            if(goResults[i].serialNumber == obj.vehicle.GoSerialNumber) {
                                console.log("IS EQUAL");
                                updateOdometer(goResults[i], objResults[k]);
                                updateEngineHours(goResults[i], objResults[k]);
                                newObj = false; 
                            }
                        }
                    }
                    
                    if(newObj == true){
                        console.log("Creating New Vehicle Object");
                        createNewAddinObj(goResults[i]); 
                    }
                }
                
            }, function(e) {
                console.error("Failed Get Addin:", e);
                
        });
    }, function(e) {
        console.error("Failed Get Device:", e);
    });
    }

    //updates odometer value for the addin data objects 
    var updateOdometer = function (device, obj) {
        console.log("Updating Odometer Value");
        console.log("Device", device);
        
        var results = [];
        var diagnostic = {
                    id: "DiagnosticOdometerAdjustmentId"
                };
        var now = new Date().toISOString();
        var full_obj = obj; 
        var data_obj = JSON.parse(obj.data);
        
        api.call("Get", {
            typeName : "StatusData",
            search : {
                fromDate : now,
                toDate : now,
                diagnosticSearch : diagnostic,
                deviceSearch : device
            }
            
        }, function (results) {
            console.log("Result: ", results);
            
            console.log("Before", data_obj.vehicle.odometer);
            data_obj.vehicle.odometer = Math.round(results[0].data/1000);
            console.log("After", data_obj.vehicle.odometer);
            
            full_obj.data = JSON.stringify(data_obj);
            
            api.call("Set",
                {
                  "typeName": "AddInData",
                  "entity": full_obj
                },
                function (result) {
                    console.log("Set: ", result);
                });
                
                console.log("Odometer Value has been updated");
                
        },function(e) {
            console.error("Failed:", e);
        });
    }

    //updates engine hours for the addin data objects 
    var updateEngineHours = function (device, obj) {
        console.log("Updating Engine Hours");
        console.log("Device", device);
        
        var results = [];
        var diagnostic = {
                    id: "DiagnosticEngineHoursAdjustmentId"
                };
        var now = new Date().toISOString();
        var full_obj = obj; 
        var data_obj = JSON.parse(obj.data);
        
        api.call("Get", {
            typeName : "StatusData",
            search : {
                fromDate : now,
                toDate : now,
                diagnosticSearch : diagnostic,
                deviceSearch : device
            }
            
        }, function (results) {
            console.log("Result: ", results);
            
            console.log("Before", data_obj.vehicle.odometer);
            data_obj.vehicle.odometer = results[0].data;
            console.log("After", data_obj.vehicle.odometer);
            
            full_obj.data = JSON.stringify(data_obj);
            
            api.call("Set",
                {
                  "typeName": "AddInData",
                  "entity": full_obj
                },
                function (result) {
                    console.log("Set: ", result);
                });
                
                console.log("Engine hours have been updated");
                
        },function(e) {
            console.error("Failed:", e);
        });
    }

    //creates a new addin data objects from a go device 
    var createNewAddinObj = function (device) {
        
        api.call("Add",
            {
          "typeName": "AddInData",
          "entity": {
            "addInId": "asTJLQJnQeEurmmJe6pqcAw",
            "groups": [{
                "id": "GroupCompanyId"
            }],
            "data": JSON.stringify({
            "vehicle": {
                "name": device.name, "type": "string", "vin": device.vehicleIdentificationNumber, "odometer":"number(int)", "engineHours": "number(int)", "modelYear": "number(int)", "GoSerialNumber": device.serialNumber
            },
            "maintenance":{
                "tasks":[
                {
                    "item": {"name":"string", "description":"string", "isActive": "bool", "taskID": "string" 
                    },
                    "schedule":
                    {
                        "timeInt": "number(int)", "enghrInt":"number(int)", "mileInt": "number(int)", "upcoming": "bool", "overdue": "bool"
                    } 
                }],
                "history": [
                    {
                        "service": {
                        "task":{"name":"string", "taskID": "string"}, 
                        "completedDate": "string", "odometerWhenCompleted": "number(int)", "engineHoursWhenCompleted": "number(int)"
                        }
                    }
                ]
            }
            })
          }
        }, function (result){
            console.log("Added Data", result);
        }, function(e) {
            console.error("Failed Adding New Addin Object:", e);
        });
    }

    //Update the number of upcoming maintenance tasks in the upcoming card
    var populateUpcomingCards = function () {
        console.log("Getting Data to Populate Cards"); 
        api.call("Get",
            {
              "typeName": "AddInData",
              "search": {
                  "addInId": "asTJLQJnQeEurmmJe6pqcAw"
              }
            }, function(result) {
            //logging for debugging
            console.log("Result 1: ", result);

            //populating table with overdue data 
            var upcoming = 0; 
            var i = 0;
                while(typeof result[i] !==  'undefined' && result[i] !== null) {
                    var obj_ov = JSON.parse(result[i].data);

                    if(typeof obj_ov.maintenance.tasks !== 'undefined'){
                        for(var idx = 0; idx < obj_ov.maintenance.tasks.length; idx++) {
                            if(obj_ov.maintenance.tasks[idx].schedule.upcoming == 'true') {
                                upcoming++; 
                            } 
                        }
                    } 
                    i++;
                }
                document.getElementById("number-upcoming").innerHTML = upcoming;
            }, function(e) {
                console.error("Failed:", e);
            });
    }

    //Update the number of overdue maintenance tasks in the overdue card
    var populateOverdueCards = function () {
        console.log("Getting Data into Populate Cards"); 
        api.call("Get",
            {
              "typeName": "AddInData",
              "search": {
                  "addInId": "asTJLQJnQeEurmmJe6pqcAw"
              }
            }, function(result) {
            //logging for debugging
            console.log("Result 1: ", result);

            //populating table with overdue data 
            var overdue = 0; 
            var i = 0;
                while(typeof result[i] !==  'undefined' && result[i] !== null) {
                    var obj_ov = JSON.parse(result[i].data);

                    if(typeof obj_ov.maintenance.tasks !== 'undefined'){
                        for(var idx = 0; idx < obj_ov.maintenance.tasks.length; idx++) {
                            if(obj_ov.maintenance.tasks[idx].schedule.overdue == 'true') {
                                overdue++; 
                            } 
                        }
                    } 
                    i++;
                }
                document.getElementById("number-overdue").innerHTML = overdue;
            }, function(e) {
                console.error("Failed:", e);
            });
    }

    //populate upcoming table with all the fields 
    var generateUpcomingTable = function () {
        //Multicall to get data objects 
        console.log("Getting Data to Upcoming Table"); 
        api.call("Get",
            {
              "typeName": "AddInData",
              "search": {
                  "addInId": "asTJLQJnQeEurmmJe6pqcAw"
              }
            }, function(result) {
            //logging for debugging
            console.log("Result 1: ", result);

            //populating table with overdue data 
            var i = 0;
                while(typeof result[i] !==  'undefined' && result[i] !== null) {
                    console.log(i, result[i]);
                    var obj_ov = JSON.parse(result[i].data);

                    if(typeof obj_ov.maintenance.tasks !== 'undefined'){
                        //iterate through all tasks per vehicle 
                        for(var idx = 0; idx < obj_ov.maintenance.tasks.length; idx++) {
                            //add table row html 
                            var row_ov = document.createElement('TR');
                            row_ov.innerHTML = document.getElementById('upcomingTableRowInsert').innerHTML;
                            document.getElementById('UpcomingTable').appendChild(row_ov);

                            //update data and fields in each row
                            //task info
                            var vehicleName = obj_ov.vehicle.name;
                            var taskName = obj_ov.maintenance.tasks[idx].item.name;
                            var enghrInt = obj_ov.maintenance.tasks[idx].schedule.enghrInt;
                            var mileInt = obj_ov.maintenance.tasks[idx].schedule.mileInt;
                            var timeInt = obj_ov.maintenance.tasks[idx].schedule.timeInt;
                            var odometer = obj_ov.vehicle.odometer; 
                            var upcoming =  obj_ov.maintenance.tasks[idx].schedule.upcoming;
                            var overdue =  obj_ov.maintenance.tasks[idx].schedule.overdue;
                            
                            if (typeof obj_ov.maintenance.history[0] !== 'undefined') {
                                //history info
                                var lastCompleteDate = obj_ov.maintenance.history[0].service.completedDate;
                                var lastCompleteEngHr = obj_ov.maintenance.history[0].service.engineHoursWhenCompleted;
                                var lastCompleteOdometer = obj_ov.maintenance.history[0].service.odometerWhenCompleted;
                                var lastCompleteTaskName = obj_ov.maintenance.history[0].service.task.name;
                            }

                            if (upcoming ==  "true") {
                                //change status from overdue to upcoming

                                row_ov.querySelector("#overall-status").innerHTML = "Upcoming";
                                row_ov.querySelector("#overall-status").className = "rounded-sm p-1 bg-warning text-light";
                            }

                            //updating the information in each table row 
                            row_ov.querySelector("#maintenance-table-row-equipment-name").innerHTML = vehicleName;
                            row_ov.querySelector("#maintenance-table-row-task-name").innerHTML = taskName;
                            //Adding all the intervals 

                            ////////////////////////////////////////////////////////////////////////////////////////////////
                            if( typeof mileInt != 'undefined' && typeof mileInt === 'number'){
                            row_ov.querySelector("#maintenance-table-row-task-interval-text").innerHTML = "Miles: "+mileInt;
                            }else{row_ov.querySelector("#maintenance-table-row-task-interval-text").innerHTML = ""; }
                            ///////////////////////////////////////////////////////////////////////////////////////////////////// 

                            
                                //Adding interval elements 

                                 if(typeof timeInt != 'undefined' &&  typeof timeInt === 'number'){
                                var div1 = document.createElement('div');
                                div1.className = "ml-2 text-xs"; 
                                var text1 = document.createElement('text');
                                text1.className = "text-secondary my-n2"; 

                                /////////////////////////////////////////////////////////////////////////////////////
                               text1.innerHTML = "Time: "+timeInt;
                                div1.appendChild(text1);
                                row_ov.querySelector("#maintenance-table-row-task-name").appendChild(div1);
                                }
                            
                                ////////////////////////////////////////////////////////////////////////////////////////

                                
                            if(typeof enghrInt != 'undefined' && typeof enghrInt === 'number'){
                                var div2 = document.createElement('div');
                                div2.className = "ml-2 text-xs"; 
                                var text2 = document.createElement('text');
                                text2.className = "text-secondary my-n2";

                                /////////////////////////////////////////////////////////////////////////////////////////////////
                                text2.innerHTML = "Engine Hours: "+enghrInt;
                                /////////////////////////////////////////////////////////////////////////////////////////////

                                div2.appendChild(text2);
                                row_ov.querySelector("#maintenance-table-row-task-name").appendChild(div2);
                            }

                            //Update last completed items 
                            row_ov.querySelector("#maintenance-table-row-task-due-in").innerHTML = (lastCompleteOdometer + mileInt) - odometer;
                            row_ov.querySelector("#maintenance-table-row-last-complete-date").innerHTML = lastCompleteDate;

                        }
                    } 
                    i++;
                }

        }, function(e) {
            console.error("Failed:", e);
        });
    }

    //populate the history table with all the fields 
    var generateHistoryTable = function () {
        //Call to get all history objects  
        console.log("Getting Data into History Table"); 
        api.call("Get",
            {
              typeName: "AddInData",
              search: {
                  addInId: "asTJLQJnQeEurmmJe6pqcAw",
                  
              }
            }, function(result) {
            //logging for debugging
            console.log("Result : ", result);

            //populating table with historical data 
            
               for(var k=0; k<result.length;k++) {
                    console.log(k, result[k]);
                    var obj_ov = JSON.parse(result[k].data);

                    //iterate through all tasks per vehicle 
                    for(var idx = 0; idx < obj_ov.maintenance.history.length; idx++) {
                        //add table row html 
                        console.log(k, idx, obj_ov.maintenance.history[idx].service.task.name);

                        var row_ov = document.createElement('TR');
                        row_ov.innerHTML = document.getElementById('historyTableRowInsert').innerHTML;
                        document.getElementById('HistoryTable').appendChild(row_ov);
                        
                        //Fix api call to get vehicle name 
                        var vehicleName = obj_ov.vehicle.name;

                        var CompleteDate = obj_ov.maintenance.history[idx].service.completedDate;
                        var CompleteEngHr = obj_ov.maintenance.history[idx].service.engineHoursWhenCompleted;
                        var CompleteOdometer = obj_ov.maintenance.history[idx].service.odometerWhenCompleted;
                        var CompleteTaskName = obj_ov.maintenance.history[idx].service.task.name;


                                // var lastCompleteDate = obj_ov.maintenance.history[0].service.completedDate;
                                // var lastCompleteEngHr = obj_ov.maintenance.history[0].service.engineHoursWhenCompleted;
                                // var lastCompleteOdometer = obj_ov.maintenance.history[0].service.odometerWhenCompleted;
                                // var lastCompleteTaskName = obj_ov.maintenance.history[0].service.task.name;


                        //updating the information in each table row 
                        row_ov.querySelector("#history-table-equipment-name").innerHTML = vehicleName;
                        row_ov.querySelector("#history-table-task-name").innerHTML = CompleteTaskName;
                        row_ov.querySelector("#history-table-task-interval-value").innerHTML = CompleteOdometer;
                        row_ov.querySelector("#history-table-last-complete-date").innerHTML = CompleteDate;
                    }
                    
                }

        }, function(e) {
            console.error("Failed:", e);
        });
    }
//============================== Main Code Here =====================================

  return {
        /**
         * initialize() is called only once when the Add-In is first loaded. Use this function to initialize the
         * Add-In's state such as default values or make API requests (MyGeotab or external) to ensure interface
         * is ready for the user.
         * @param {object} freshApi - The GeotabApi object for making calls to MyGeotab.
         * @param {object} freshState - The page state object allows access to URL, page navigation and global group filter.
         * @param {function} initializeCallback - Call this when your initialize route is complete. Since your initialize routine
         *        might be doing asynchronous operations, you must call this method when the Add-In is ready
         *        for display to the user.
         */
        initialize: function (api, state, callback) {
            populateUpcomingInterface(); 
            callback(); //only needed here 
        },

        /**
         * focus() is called whenever the Add-In receives focus.
         *
         * The first time the user clicks on the Add-In menu, initialize() will be called and when completed, focus().
         * focus() will be called again when the Add-In is revisited. Note that focus() will also be called whenever
         * the global state of the MyGeotab application changes, for example, if the user changes the global group
         * filter in the UI.
         *
         * @param {object} freshApi - The GeotabApi object for making calls to MyGeotab.
         * @param {object} freshState - The page state object allows access to URL, page navigation and global group filter.
         */
        focus: function (api, state) {

        },

        /**
         * blur() is called whenever the user navigates away from the Add-In.
         *
         * Use this function to save the page state or commit changes to a data store or release memory.
         *
         * @param {object} freshApi - The GeotabApi object for making calls to MyGeotab.
         * @param {object} freshState - The page state object allows access to URL, page navigation and global group filter.
         */
        blur: function (api, state) {
            
        }
    };
}; 