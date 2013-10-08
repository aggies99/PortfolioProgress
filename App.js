Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',

    launch: function() {
        MyApp = this;
        
        MyApp.globalContext = this.getContext().getDataContext();
        
        if (typeof globalFilter != 'undefined') {
            MyApp.filterOptions = globalFilter;
        }
        else {
            MyApp.filterOptions = [ 'Not set' ];
        }
        if (typeof singleFilter != 'undefined') MyApp.filter = singleFilter;
        
        MyApp._drawComboBox();
        
        MyApp.leftPane = Ext.create('Ext.container.Container', {
            componentCls: 'inner'
        });
        MyApp.add(MyApp._wrapComponent(MyApp.leftPane, 'lefty'));
        
        MyApp.rightPane = Ext.create('Ext.container.Container', {
            componentCls: 'inner'
        });
        MyApp.add(MyApp._wrapComponent(MyApp.rightPane, 'righty'));
        
        // If we have a filter set, then we don't need a combo box for this app
        if( MyApp.filter ){
            MyApp.remove(MyApp.combo);
            
            MyApp._loadMilestoneStatus();
        }
        else {
            // This draws our default program data
            MyApp.combo.setValue(MyApp.filterOptions[0]);            
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
            store: MyApp.filterOptions,
            listeners: {
                'change': function(combo, newVal) {
                    var start = 0;
                    if (newVal.charAt(0) === '-' ) start = 2;
                    
                    MyApp.filter = newVal.substr(start);
                
                    MyApp._loadMilestoneStatus();
                }
            }
        });
        
        MyApp.add(MyApp.combo);
    },
    
    _loadMilestoneStatus: function() {    
        var thisIsMyStore = Ext.create('Rally.data.WsapiDataStore', {
        autoLoad: true,
            
        model: 'PortfolioItem/Epic',
        
        context: MyApp.globalContext,
        
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
                property: 'Rank',
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

        //Rally.sdk.util.DateTime.fromIsoString(dateString, true), 'yyyy-MM-dd');

        MyApp.milestoneGrid = Ext.create('Rally.ui.grid.Grid', {
            store: myStore,
            title: 'Milestone Status',
            columnCfgs: [
                'FormattedID',
                {dataIndex: 'Name', width: 300, text:'Release'},
                'PlannedStartDate',
                'PlannedEndDate',
                {dataIndex: 'AcceptedLeafStoryPlanEstimateTotal', width: 60, text:'Accepted Points'},
                {dataIndex: 'LeafStoryPlanEstimateTotal', width: 60, text:'Total Points'},
                'PercentDoneByStoryPlanEstimate'
            ],
            showPagingToolbar: false            
        });

        MyApp.leftPane.add(MyApp.milestoneGrid);
        
        // Load the subsystem after milestones
        MyApp._loadSubsystemStatus();
    },
    
    _loadSubsystemStatus: function() {    
        var thisIsMyStore = Ext.create('Rally.data.WsapiDataStore', {
        autoLoad: true,
            
        model: 'PortfolioItem/MMF',
        
        context: MyApp.globalContext,
        
        fetch: ['Parent',
                'Project',
                'FormattedID',
                'Name',
                'AcceptedLeafStoryPlanEstimateTotal',
                'LeafStoryPlanEstimateTotal',
                'PercentDoneByStoryPlanEstimate'
                ],
            
        filters: [
                {
                    property: 'Parent.Name',
                    operator: 'Contains',
                    value: MyApp.filter
                },
                {
                    property: 'PercentDoneByStoryPlanEstimate',
                    operator: '<',
                    value: 1
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
            MyApp.leftPane.remove(MyApp.subsystemGrid);
        }
        
        MyApp.subsystemGrid = Ext.create('Rally.ui.grid.Grid', {
            store: myStore,
            title: 'Subsystem Status (Not complete only)',
            columnCfgs: [
                'Parent',
                'Project',
                'FormattedID',
                {dataIndex: 'Name', width: 300, text:'Scope'},
                {dataIndex: 'AcceptedLeafStoryPlanEstimateTotal', width: 60, text:'Accepted Points'},
                {dataIndex: 'LeafStoryPlanEstimateTotal', width: 60, text:'Total Points'},
                'PercentDoneByStoryPlanEstimate'
            ],
            showPagingToolbar: false            
        });
        
        MyApp.leftPane.add(MyApp.subsystemGrid);

        
        // Load the features after subsystem
        MyApp._loadFeatureStatus();
    },

    _loadFeatureStatus: function() {    
        var thisIsMyStore = Ext.create('Rally.data.WsapiDataStore', {
        autoLoad: true,
            
        model: 'PortfolioItem/Feature',
        
        context: MyApp.globalContext,
        
        fetch: ['Parent',
                'Project',
                'FormattedID',
                'Name',
                'PreliminaryEstimate',
                'AcceptedLeafStoryPlanEstimateTotal',
                'LeafStoryPlanEstimateTotal',
                'PercentDoneByStoryPlanEstimate'
                ],
            
        filters: [
                {
                    property: 'Parent.Parent..Name',
                    operator: 'Contains',
                    value: MyApp.filter
                },
                {
                    property: 'PercentDoneByStoryPlanEstimate',
                    operator: '<',
                    value: 1
                }
            ],

            sorters: {
                property: 'Rank',
                direction: 'ASC'
            },
            
            listeners: {
                load: MyApp._drawFeatureGrid
            }
        });
    },
    
    _drawFeatureGrid: function(myStore) {
        if( MyApp.featureGrid ) {
            MyApp.rightPane.remove(MyApp.featureGrid);
        }
        
        MyApp.featureGrid = Ext.create('Rally.ui.grid.Grid', {
            store: myStore,
            title: 'Feature Status (Not complete only)',
            columnCfgs: [
                'Parent',
                'Project',
                'FormattedID',
                {dataIndex: 'Name', width: 300, text:'Feature'},
                'PreliminaryEstimate',
                {dataIndex: 'AcceptedLeafStoryPlanEstimateTotal', width: 60, text:'Accepted Points'},
                {dataIndex: 'LeafStoryPlanEstimateTotal', width: 60, text:'Total Points'},
                'PercentDoneByStoryPlanEstimate'
            ],
            showPagingToolbar: false            
        });
        
        MyApp.rightPane.add(MyApp.featureGrid);
    }
});
