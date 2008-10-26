/*global SWFUpload*/
/*global jQuery*/
/*global fluid_0_6*/

fluid_0_6 = fluid_0_6 || {};

(function ($, fluid) {
    
    var numReadyFiles = function (that) {
        var count = 0;
        for (var i = 0; i < that.queue.files.length; i++) {
            count += (that.queue.files[i].filestatus > SWFUpload.FILE_STATUS.COMPLETE);
        }  
        return count;  
    };
    
    var sizeOfUploadedFiles = function (that) {
        var totalBytes = 0;
        for (var i = 0; i < that.queue.files.length; i++) {
            var file = that.queue.files[i];
            totalBytes += (file.filestatus === SWFUpload.FILE_STATUS.COMPLETE) ? file.size : 0;
        }          
        return totalBytes;
    };
        
    var sizeOfReadyFiles = function (that) {
        var totalBytes = 0;
        for (var i = 0; i < that.queue.files.length; i++) {
            var file = that.queue.files[i];
            totalBytes += (file.filestatus < SWFUpload.FILE_STATUS.COMPLETE) ? file.size : 0;
        }          
        return totalBytes;
    };

    /********************
     * SWFUploadManager *
     ********************/
    
    // Maps SWFUpload's setting names to our component's setting names.
    var swfUploadOptionsMap = {
        uploadURL: "upload_url",
        flashURL: "flash_url",
        postParams: "post_params",
        fileSizeLimit: "file_size_limit",
        fileTypes: "file_types",
        fileTypesDescription: "file_types_description",
        fileUploadLimit: "file_upload_limit",
        fileQueueLimit: "file_queue_limit",
        debug: "debug"
    };
    
    // Maps SWFUpload's callback names to our component's callback names.
    var swfUploadEventMap = {
        afterReady: "swfupload_loaded_handler",
        onFileBrowse: "file_dialog_start_handler",
        afterFileQueued: "file_queued_handler",
        onQueueError: "file_queue_error_handler",
        afterFileBrowse: "file_dialog_complete_handler",
        onUploadStart: "upload_start_handler",
        onFileProgress: "upload_progress_handler",
        onUploadError: "upload_error_handler",
        afterFileUploaded: "upload_success_handler",
        afterUploadComplete: "upload_complete_handler"
    };
    
    var mapNames = function (nameMap, source, target) {
        var result = target || {};
        for (var key in source) {
            var mappedKey = nameMap[key];
            result[mappedKey] = source[key];
        }
        
        return result;
    };
    
    // For each event type, hand the fire function to SWFUpload so it can fire the event at the right time for us.
    var mapEvents = function (nameMap, events, target) {
        var result = target || {};
        for (var eventType in events) {
            var fireFn = events[eventType].fire;
            var mappedName = nameMap[eventType];
            result[mappedName] = fireFn;
        }
    };

    // Invokes the OS browse files dialog, allowing either single or multiple select based on the options.
    var browse = function (swfUploader, fileQueueLimit) {              
        if (fileQueueLimit === 1) {
            swfUploader.selectFile();
        } else {
            swfUploader.selectFiles();
        }  
    };
    
    var bindEvents = function (that) {
        // Add a listener that will keep our file queue model in sync with SWFUpload.
        that.events.afterFileQueued.addListener(function (file) {
            that.queue.addFile(file); 
        });
    };
    
    var removeFile = function (that, file) {
        that.queue.removeFile(file);
        that.events.afterFileRemoved.fire(file);
    };
    
    // Instantiates a new SWFUploader instance and attaches it the upload manager.
    var setupSwfUploadManager = function (that, events) {
        that.events = events;
        that.queue = fluid.fileQueue();
        
        // Map the event and settings names to SWFUpload's expectations.
        var settings = mapNames(swfUploadOptionsMap, that.options);
        mapEvents(swfUploadEventMap, that.events, settings);
        
        // Setup the instance.
        that.swfUploader = new SWFUpload(settings);
        that.currentStats = {
            bytesUploaded: 0  
        };
        
        bindEvents(that);
    };
    
    /**
     * Server Upload Manager is responsible for coordinating with the Flash-based SWFUploader library,
     * providing a simple way to start, pause, and cancel the uploading process. It requires a working
     * server to respond to the upload POST requests.
     * 
     * @param {Object} eventBindings an object containing upload lifecycle callbacks
     * @param {Object} options configuration options for the upload manager
     */
    fluid.swfUploadManager = function (events, options) {
        var that = {};
        
        // This needs to be refactored!
        fluid.mergeComponentOptions(that, "fluid.swfUploadManager", options);
        fluid.mergeListeners(events, that.options.listeners);
   
        /**
         * Opens the native OS browse file dialog.
         */
        that.browseForFiles = function () {
            browse(that.swfUploader, that.options.fileQueueLimit);
        };
        
        /**
         * Removes the specified file from the upload queue.
         * 
         * @param {File} file the file to remove
         */
        that.removeFile = function (file) {
            removeFile(that, file);
        };
        
        /**
         * Starts uploading all queued files to the server.
         */
        that.start = function () {

        };
        
        /**
         * Pauses an in-progress upload.
         */
        that.pause = function () {
        
        };
        
        /**
         * Cancels an in-progress upload.
         */
        that.cancel = function () {
        
        };
        
        setupSwfUploadManager(that, events);
        return that;
    };
    
    fluid.defaults("fluid.swfUploadManager", {
        uploadURL: "",
        flashURL: "../../swfupload/swfupload_f9.swf",
        postParams: {},
        fileSizeLimit: "20480",
        fileTypes: "*.*",
        fileTypesDescription: null,
        fileUploadLimit: 0,
        fileQueueLimit: 0,
        debug: false
    });
})(jQuery, fluid_0_6);
