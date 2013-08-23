Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',

    launch: function() {
        MyApp = this;
        // MyApp.filter = 'MY14';
        
        MyApp._drawComboBox();
        
        MyApp.leftPane = Ext.create('Ext.container.Container', {
            componentCls: 'inner'
        });
        MyApp.add(MyApp._wrapComponent(MyApp.leftPane, 'lefty'));
        
        MyApp.rightPane = Ext.create('Ext.container.Container', {
            componentCls: 'inner'
        });
        MyApp.add(MyApp._wrapComponent(MyApp.rightPane, 'righty'));
        
        if( MyApp.filter ){
            MyApp.remove(MyApp.combo);
            
            MyApp._loadMilestoneStatus();
            MyApp._loadSubsystemStatus();
        }
        else {
            // This draws our default program data
            MyApp.combo.setValue(MyApp.filter);            
        }
    },
    
    _wrapComponent: function(component, cls) {
        var wrapper = Ext.create('Ext.container.Container', {
            componentCls: cls
        });
        
        wrapper.add(component);
        
        return wrapper;
    },
    
    _drawComboBox: function() {
        MyApp.combo = Ext.create('Ext.form.ComboBox', {
            fieldLabel: 'Program',
            store: ['MY14', 'MY15', 'MY16', 'MY17'],
            listeners: {
                /*'select': function(combo, records) {
                    filter = records[0].get('field1');
                    console.log(filter);
                },*/
                'change': function(combo, newVal) {
                    MyApp.filter = newVal;
                    console.log(MyApp.filter);
                    
                    MyApp._loadMilestoneStatus();
                    MyApp._loadSubsystemStatus();
                }
            }
        });
        
        MyApp.add(MyApp.combo);
    },
    
    _loadMilestoneStatus: function() {    
        var thisIsMyStore = Ext.create('Rally.data.WsapiDataStore', {
        autoLoad: true,
            
        model: 'PortfolioItem/Epic',
        
        fetch: ['FormattedID',
                'Name',
                'PlannedStartDate',
                'PlannedEndDate',
                'AcceptedLeafStoryPlanEstimateTotal',
                'LeafStoryPlanEstimateTotal',
                'PercentDoneByStoryPlanEstimate'
                ],
            
        filters: [
                {
                    property: 'Name',
                    operator: 'Contains',
                    value: MyApp.filter
                }
            ],

            sorters: {
                property: 'PlannedStartDate',
                direction: 'ASC'
            },
            
            listeners: {
                load: MyApp._drawMilestoneGrid
            }
        });
    },
    
    _drawMilestoneGrid: function(myStore) {
        if( MyApp.milestoneGrid ) {
            MyApp.leftPane.remove(MyApp.milestoneGrid);
        }
                
        MyApp.milestoneGrid = Ext.create('Rally.ui.grid.Grid', {
            store: myStore,
            title: 'Milestone Status',
            columnCfgs: [
                'FormattedID',
                'Name',
                'PlannedStartDate',
                'PlannedEndDate',
                'AcceptedLeafStoryPlanEstimateTotal',
                'LeafStoryPlanEstimateTotal',
                'PercentDoneByStoryPlanEstimate'
            ],
            showPagingToolbar: false            
        });

        MyApp.leftPane.add(MyApp.milestoneGrid);
    },
    
    _loadSubsystemStatus: function() {    
        var thisIsMyStore = Ext.create('Rally.data.WsapiDataStore', {
        autoLoad: true,
            
        model: 'PortfolioItem/MMF',
        
        fetch: ['Parent',
                'FormattedID',
                'Name',
                'PlannedStartDate',
                'PlannedEndDate',
                'AcceptedLeafStoryPlanEstimateTotal',
                'LeafStoryPlanEstimateTotal',
                'PercentDoneByStoryPlanEstimate'
                ],
            
        filters: [
                {
                    property: 'Parent.Name',
                    operator: 'Contains',
                    value: MyApp.filter
                }
            ],

            sorters: {
                property: 'Rank',
                direction: 'ASC'
            },
            
            listeners: {
                load: MyApp._drawSubsystemGrid
            }
        });
    },
    
    _drawSubsystemGrid: function(myStore) {
        if( MyApp.subsystemGrid ) {
            MyApp.rightPane.remove(MyApp.subsystemGrid);
        }
        
        MyApp.subsystemGrid = Ext.create('Rally.ui.grid.Grid', {
            store: myStore,
            title: 'Subsystem Status',
            columnCfgs: [
                'Parent',
                'FormattedID',
                'Name',
                'PlannedStartDate',
                'PlannedEndDate',
                'AcceptedLeafStoryPlanEstimateTotal',
                'LeafStoryPlanEstimateTotal',
                'PercentDoneByStoryPlanEstimate'
            ],
            showPagingToolbar: false            
        });
        
        MyApp.rightPane.add(MyApp.subsystemGrid);
    }

});
