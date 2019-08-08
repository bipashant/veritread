// 'use strict';

var VTApp = (function () {
  var app = function (options) {
    // assign options
    assetsDir = options.assetsDir || 'veritread/';
    env = options.env || 'production';
    embedCss = (options.embedCss === 'no') ? false : true;
    elementToUse = options.elementToUse || '.vtitem';
    elementName = elementToUse.substring(1);
    localDimensionsLabel = options.dimensionsLabel || 'Dimensions for This Item';

    source = options.partnerId || source;

    templates = options.templates || {};

    setupEnvironment();
 };

  var source = '66',
      assetsDir = 'veritread/',
      env = 'production',
      embedCss = 'true',
      elementToUse = '',
      elementName = '',
      localDimensionsLabel = '',
      apiUrl = 'https://vtapi.veritread.com/api/Estimator',
      postBaseUrl = 'https://www.veritread.com/postaload/makeandmodel.aspx',

      METERS_PER_FOOT = 0.3048,
      KILOS_PER_POUND = 0.453592,
      FEET_PER_METER = 3.28084,
      POUNDS_PER_KILO = 2.20462,
      VALID_COUNTRIES = ['US', 'CA', 'MX'],

      limitAllowedSpecs = false,
      isMultiSourceSpecs = false,

      templates = {},

      retries = {
        vt: 0,
        pu: 0,
        do: 0
      },

      noEstimate = {
        heading: 'Common Reasons for No Estimate:',
        contents: [
          'Item is highly specialized and typically requires teardown services or other special loading considerations.',
          'Extremely rare pickup or destination locations.',
          'Pick-up or Delivery locations outside of North America (i.e. Shipping Pickup Location &amp; Drop-off Location Internationally).'
        ],
        error1: 'Unfortunately we are not comfortable providing an automated shipping estimate for this item.',
        error2: 'Please list this item on VeriTread and receive Free, no-obligation freight quotes from qualified transportation companies.',
        button: 'List Shipment'
      },

      items = [];

  var Estimator = (function() {
    var estimator = {};

    var make = "",
        model = "",
        catId = "",
        fromCountry = "",  // optional
        fromCountryISO = "", // required
        fromZip = "",      // required
        fromCity = "",     // optional
        fromState = "",    // optional
        toCountry = "",    // optional
        toCountryISO = "", // required
        toZip = "",        // required
        toCity = "",       // optional
        toState = "",      // optional

        baseEstimate = 0,

        length = { english: 0, metric: 0 },
        width = { english: 0, metric: 0 },
        height = { english: 0, metric: 0 },
        attWidth = { english: 0, metric: 0 },
        angAttWidth = { english: 0, metric: 0 },
        weight = { english: 0, metric: 0 },

        elementToUse = '',
        elementName = '',
        assetsDir = '',

        pointer = {
          isDragging: false,
          wasDragging: false,
          initialOffsetY: 0,
          currentMousePosY: 0,

          initialOffsetX: 0,
          currentMousePosX: 0
  };

    function getPostUrl() {
        var postUrl = postBaseUrl,
            prefix = elementToUse.substr(1);

        postUrl += '?Mode=QP';
        postUrl += '&Make=' + encodeURIComponent( make );
        postUrl += '&Model=' + encodeURIComponent( model );
        postUrl += '&cat=' + encodeURIComponent( catId );
        postUrl += '&src=' + encodeURIComponent( source );

        // postUrl += '&toCountry=' + encodeURIComponent( toCountry );
        // postUrl += '&toZip=' + encodeURIComponent( $(elementToUse + ' .delivery-location').val() );

        postUrl += '&lf=' + encodeURIComponent( $('#' + prefix + '-item-length-feet').val() );
        postUrl += '&li=' + encodeURIComponent($('#' + prefix + '-item-length-inches').val());

        postUrl += '&wf=' + encodeURIComponent($('#' + prefix + '-item-width-feet').val());
        postUrl += '&wi=' + encodeURIComponent($('#' + prefix + '-item-width-inches').val());

        postUrl += '&hf=' + encodeURIComponent($('#' + prefix + '-item-height-feet').val());
        postUrl += '&hi=' + encodeURIComponent($('#' + prefix + '-item-height-inches').val());

        postUrl += '&af=' + encodeURIComponent($('#' + prefix + '-item-attwidth-feet').val());
        postUrl += '&ai=' + encodeURIComponent($('#' + prefix + '-item-attwidth-inches').val());

        postUrl += '&aaf=' + encodeURIComponent($('#' + prefix + '-item-angattwidth-feet').val());
        postUrl += '&aai=' + encodeURIComponent($('#' + prefix + '-item-angattwidth-inches').val());

        postUrl += '&wt=' + encodeURIComponent($('#' + prefix + '-item-weight').val());

        postUrl += '&from=' + encodeURIComponent( fromZip );
        postUrl += '&fromC=' + encodeURIComponent( fromCountry );

        postUrl += '&to=' + encodeURIComponent( toZip );
        postUrl += '&toC=' + encodeURIComponent( toCountry );

        return postUrl;
      }

      function insertTemplate() {
        var templateData = {
          elementName: elementName,
          localDimensionsLabel: localDimensionsLabel,
          assetsDir: assetsDir
        };

        var templateContent = templates.insert(templateData, source);

        $(elementToUse).html(templateContent);
        $(elementToUse).addClass('veritread veritread-estimator');

        if ($('.vt-video')) {
            updateVideo();
        }
      }

    function updateVideo() {
        $.ajax({
          url: apiUrl + '/VideoURL',
          dataType: 'jsonp',
          jsonp: 'callback',
          timeout: 10000,
          error: function(x, t, m) {
            //
          },
          success: function (data) {
            if (data.videoURL && data.videoURL !== "")
            {
              $('.vt-video').attr('href', data.videoURL);
            }
          },
          failure: function () {
          }
        });
    }

    function configureItem() {
        // $(elementToUse + ' .item-make').html(make);
        // $(elementToUse + ' .item-model').html(model);
          $.ajax({
            url: apiUrl,
            dataType: 'jsonp',
            jsonp: 'callback',
            data: {
              Make: make,
              Model: model
            },
            success: function (data) {
              // console.log(data);
              if (data.errormsg)
              {
                  // showPlaceholder();
                  if (data.errormsg.indexOf('Equipment Not Found' === 0)) {
                      $(elementToUse + ' .vt-bad-lookup').show();
                      $('.vt-specs-and-inputs').hide();
                      hideEstimatorResults();
                  } else {
                      showError(data.errormsg);
                  }
              }
              else
              {
                showEstimator();
                setSchematicImage(data);
                setSpecs(data, 'vt', false);
              }

              $(elementToUse + ' .vt-updating').remove();
            },
            failure: function () {
              // showPlaceholder();
              showError( "An error has occurred. Please try again." );
            }
          });
      }

    function lookUpPickupLocation() {
        var pickupLocation = $('.vt-pickup-location').val(),
            fromCityState = '',
            testState, testZip,
        tempZip = '';

        // App variables
        fromCountry = $('.vt-pickup-country').val();
        fromCity = '';
        fromState = '';
        fromZip = '';

        hideError();

        if (pickupLocation !== '' && fromCountry !== 'FR') {
            var Index = pickupLocation.indexOf(",");
            fromCityState = pickupLocation.split(",");

            var isValidZip = false;
            if (fromCityState.length < 2) {
                fromCityState = "";
                fromZip = pickupLocation;

                if (fromCountry === "US") {
                    if (Index === -1)
                    {
                        tempZip = pickupLocation.split(" ");
                        fromZip = tempZip[tempZip.length - 1];
                    }
                    if (validateUsZipCode(fromZip)) {
                        fromZip = fromZip.substring(0, 5);
                        isValidZip = true;
                    } else if (isUsZipCodeFragment(fromZip)) {
                        showError("Please enter a valid ZIP code (or a city and state) for the pick-up location.");
                        $(elementToUse + ' .vt-pickup-location').focus();
                        return false;
                    } else {
                        fromCityState[0] = pickupLocation;
                        fromCityState[1] = "";
                    }
                } else if (fromCountry === "CA") {
                    if (Index === -1) {
                        tempZip = pickupLocation.split(" ");
                        fromZip = tempZip[tempZip.length - 2] + " " + tempZip[tempZip.length - 1];;
                        if (!validateCanadianPostalCode(fromZip)) {
                            fromZip = "";
                        }
                        }
                    if (validateCanadianPostalCode(fromZip)) {
                        isValidZip = true;
                    } else {
                        fromCityState[0] = pickupLocation;
                        fromCityState[1] = "";
                    }
                } else if (fromCountry === "MX") {
                    if (Index === -1) {
                        tempZip = pickupLocation.split(" ");
                        fromZip = tempZip[tempZip.length - 1];
                    }
                    if (validateMexicanPostalCode(fromZip)) {
                        fromZip = fromZip.substring(0, 5);
                        isValidZip = true;
                    } else if (isMxPostalCodeFragment(fromZip)) {
                        showError("Please enter a valid postal code (or a city and state) for the pick-up location.");
                        $(elementToUse + ' .vt-pickup-location').focus();
                        return false;
                    } else {
                        fromCityState[0] = pickupLocation;
                        fromCityState[1] = "";
                    }
                }
            } else {
                fromCity = fromCityState[0].trim();
                fromState = fromCityState[1].trim();
                //fromZip = fromCityState.length > 2
                //    ? fromCityState[2].trim()
                //    : '';

                // test whether toState has a ZIP/postal code
                testState = fromState.split(" ");
                if (fromCountry === 'US') {
                    testZip = testState[testState.length - 1].trim();
                    if (validateUsZipCode(testZip)) {
                        fromZip = testZip.substring(0, 5);
                        testState.pop();
                        fromState = $.isArray(testState) ?
                            testState.join(' ') :
                            testState;
                    }
                } else if (fromCountry === 'MX') {
                    testZip = testState[testState.length - 1].trim();
                    if (validateMexicanPostalCode(testZip)) {
                        fromZip = testZip.substring(0, 5);
                        testState.pop();
                        fromState = $.isArray(testState) ?
                            testState.join(' ') :
                            testState;
                    }
                } else if (fromCountry === 'CA') {
                    if (testState.length >= 2) {
                        testZip = (testState[testState.length - 2] + ' ' + testState[testState.length - 1]).trim();
                        if (validateCanadianPostalCode(testZip)) {
                            fromZip = testZip;
                            testState.pop();
                            testState.pop();
                            fromState = $.isArray(testState) ?
                                testState.join(' ') :
                                testState;
                        }
                    }
                }
            }

            $.ajax({
                url: apiUrl + '/Location',
                dataType: 'jsonp',
                jsonp: 'callback',
                data: {
                    Zip: fromZip,
                    City: fromCity,
                    State: fromState,
                    Country: fromCountry
                },
                success: function (data) {
                    if (data.errormsg) {
                        // showPlaceholder();
                        showError(data.errormsg);
                    }
                    else if (!data.zip) {
                        if (retries.pu < 3) {
                            retries.pu++;
                            lookUpPickupLocation();
                        } else {
                            retries.pu = 0;
                            showError('Sorry, we had a problem looking up the ZIP/Postal Code for the pickup location. If you know the ZIP or postal code for your pickup location, please enter it.');
                        }
                    }
                    else {
                        retries.pu = 0;
                        fromZip = data.zip;
                        fromCity = data.city;
                        fromState = data.state;

                        $('.vt-pickup-location').val(fromCity + ', ' + fromState + ' ' + fromZip);
                    }

                    // $(elementToUse + ' .updating').remove();
                },
                failure: function () {
                    retries.pu = 0;
                    showError("An error has occurred. Please try again.");
                }
            });
        }
    }

    function lookUpDeliveryLocation() {
        var deliveryLocation = $('.vt-delivery-location').val(),
            toCityState = '',
            testState, testZip, tempZip = '';
        toCountry = $('.vt-delivery-country').val();
        toCity = '';
        toState = '';
        toZip = '';

        hideError();

        if (deliveryLocation !== '' && toCountry !== 'FR') {
            var isValidZip = false;

            var Index = deliveryLocation.indexOf(",");
            toCityState = deliveryLocation.split(",");
            if (toCityState.length < 2) {
                toCityState = "";
                toZip = deliveryLocation;

                if (toCountry === "US") {
                    if (Index === -1) {
                        tempZip = deliveryLocation.split(" ");
                        if (tempZip.length === 2) {
                            toCity = tempZip[tempZip.length - 2];
                            toState = tempZip[tempZip.length - 1];
                            toZip = "";
                        } else {
                            toZip = tempZip[tempZip.length - 1];
                        }
                    } 

                    if (validateUsZipCode(toZip)) {
                        toZip = toZip.substring(0, 5);
                        alidZip = true;
                    } else if (isUsZipCodeFragment(toZip)) {
                        showError("Please enter a valid ZIP code (or a city and state) for the drop-off location.");
                        $(elementToUse + ' .vt-delivery-location').focus();
                        return false;
                    } else {
                        toCityState[0] = deliveryLocation;
                        toCityState[1] = "";
                    }
                } else if (toCountry === "CA") {
                    if (Index === -1) {
                        tempZip = deliveryLocation.split(" ");
                        toZip = tempZip[tempZip.length - 2] + " " + tempZip[tempZip.length - 1];;
                        if (!validateCanadianPostalCode(toZip)) {
                            toZip = "";
                        }
                    }
                    if (validateCanadianPostalCode(toZip)) {
                        isValidZip = true;
                    } else {

                        toCityState[0] = deliveryLocation;
                        toCityState[1] = "";
                    }
                } else if (toCountry === "MX") {
                    if (Index === -1) {
                        tempZip = deliveryLocation.split(" ");
                        toZip = tempZip[tempZip.length - 1];
                    }
                    if (validateMexicanPostalCode(toZip)) {
                        toZip = toZip.substring(0, 5);
                        isValidZip = true;
                    } else if (isMxPostalCodeFragment(toZip)) {
                        showError("Please enter a valid postal code (or a city and state) for the drop-off location.");
                        $(elementToUse + ' .vt-delivery-location').focus();
                        return false;
                    } else {
                        toCityState[0] = deliveryLocation;
                        toCityState[1] = "";
                    }
                    //showError("Please enter a valid postal code for the location you are delivering to.");
                    //$('.pickup-location').focus();
                    //return false;
                }
            } 
            else {

                toCity = toCityState[0].trim();
                toState = toCityState[1].trim();

                // test whether toState has a ZIP/postal code
                testState = toState.split(" ");
                if (toCountry === 'US') {
                    testZip = testState[testState.length - 1].trim();
                    if (validateUsZipCode(testZip)) {
                        toZip = testZip.substring(0, 5);
                        testState.pop();
                        toState = $.isArray(testState) ?
                            testState.join(' ') :
                            testState;
                    }
                } else if (toCountry === 'MX') {
                    testZip = testState[testState.length - 1].trim();
                    if (validateMexicanPostalCode(testZip)) {
                        toZip = testZip.substring(0, 5);
                        testState.pop();
                        fromState = $.isArray(testState) ?
                            testState.join(' ') :
                            testState;
                    }
                } else if (toCountry === 'CA') {
                    if (testState.length >= 2) {
                        testZip = (testState[testState.length - 2] + ' ' + testState[testState.length - 1]).trim();
                        if (validateCanadianPostalCode(testZip)) {
                            toZip = testZip;
                            testState.pop();
                            testState.pop();
                            toState = $.isArray(testState) ?
                                testState.join(' ') :
                                testState;
                        }
                    }
                }
            }

            $.ajax({
                url: apiUrl + '/Location',
                dataType: 'jsonp',
                jsonp: 'callback',
                data: {
                    Zip: toZip,
                    City: toCity,
                    State: toState,
                    Country: toCountry
                },
                success: function (data) {
                    if (data.errormsg) {
                        // showPlaceholder();
                        showError(data.errormsg);
                    }
                    else if (!data.zip) {
                        if (retries.do < 3) {
                            retries.do++;
                            lookUpDeliveryLocation();
                        } else {
                            retries.do = 0;
                        }
                    }
                    else {
                        retries.do = 0;
                        toZip = data.zip;
                        toCity = data.city;
                        toState = data.state;

                        $('.vt-delivery-location').val(toCity + ', ' + toState + ' ' + toZip);
                    }
                },
                failure: function () {
                    retries.do = 0;
                    showError("An error has occurred. Please try again.");
                }
            });
        }
    }

    function render() {
        insertTemplate();

        $('.vt-get-estimate-button').click(function(e) {
          e.preventDefault();

          // setTimeout(getEstimate, 1500);
          getEstimate();
        });

        initUi();
        configureItem();

        $('[data-dismiss]').click(function(e){
          var prnt = $(this).parents( $(this).data('dismiss') ).slideToggle();
        });

        $('[data-type="english"]').change(function(e){
          var v = $(this).val();
          if( v.length > 0 && validateInt(v) )
          {
            var n = parseInt(v);

            if( $(this).attr('id').indexOf('inches') !== -1 && n === 12)
            {
              var $relF = $( $(this).data('relatedMeasure') ),
                  ft    = parseInt( $relF.val() ) ? parseInt( $relF.val() ) : 0;
              $relF.val( ft+1 );
              $(this).val(0);
            }
            else if( n !== v )
            {
              $(this).val(n);
            }
          }
          else if ( v.length > 0 && !validateInt(v) )
          {
            $(this).val('');
          }
        });


        $('[data-type="metric"]').change(function(e){
          var v = $(this).val();
          //NOTE: I don't think we need to parse out to decimal places if the value is a whole number. So, we don't need to
          //do all the conversions and replacing values we did for english.
          if ( v.length > 0 && !validateFloat(v) )
          {
            $(this).val('');
          }
        });

        $('[name=' + elementName + '-units]').change(function(e){
          var on = $('[name=' + elementName + '-units]:checked').data('typeValue'), //the newly selected option
              off= $('[name=' + elementName + '-units]:not(:checked)').data('typeValue'); //the original option, from which to convert

          convertUnits(on, off);

          $('[data-type=metric],[data-type=english],[data-type]+span').toggle();

        });

      }

    function setOriginLocation() {
      var originLoc = '';

      if (fromCity) {
        originLoc += fromCity + ', ';
      }
      if (fromState) {
        originLoc += fromState + ' ';
      }
      if (fromZip) {
        originLoc += fromZip + ' ';
      }
      if (fromCountryISO) {
        originLoc += '<br />' + fromCountryISO;
      } else if (fromCountry) {
        originLoc += '<br />' + fromCountry;
      }

      $('.vt-pickup-location-ui .vt-location').html(originLoc);
    }

    function setDeliveryLocation(locInfo) {
      var deliveryLoc = '';

      if (locInfo.deliveryCity) {
        toCity = locInfo.deliveryCity;
        deliveryLoc += toCity + ', ';
      }
      if (locInfo.deliveryState) {
        toState = locInfo.deliveryState;
        deliveryLoc += toState + ' ';
      }
      if (locInfo.deliveryPostal) {
        toZip = locInfo.deliveryPostal;
        deliveryLoc += toZip + ' ';
      }
      if (locInfo.deliveryCountry) {
        toCountry = locInfo.deliveryCountry;
        deliveryLoc += '<br />' + toCountry;
      }
      if (locInfo.deliveryCountryISO) {
        toCountryISO = locInfo.deliveryCountryISO;
        if (!toCountry) {
          deliveryLoc += '<br />' + toCountryISO;
        }
      }

      $('.vt-delivery-location-ui .vt-location').html(deliveryLoc);
      if (!deliveryLoc) {
        $(elementToUse + ' .vt-enter-delivery-location').html('Add Destination');
      } else {
        $(elementToUse + ' .vt-enter-delivery-location').html('Change Destination');
      }
    }

    function getEstimate() {
        var makeModelError = '';

        $(elementToUse + ' .vtestimator').prepend('<div class="vt-updating" style="background: #ffffff url( \'' + assetsDir + '/img/preloader.gif\' ) no-repeat 50%;background-color:rgba(255, 255, 255, 0.85);"><h3>Calculating VeriTread Freight Estimate...</h3></div>');

        setOriginLocation();
        setDeliveryLocation({
          deliveryCountry: toCountry,
          deliveryCountryISO: toCountryISO,
          deliveryState: toState,
          deliveryCity: toCity,
          deliveryPostal: toZip
        });

        // Ensure proper unit conversion before submitting specs
        var on = $('[name=' + elementName + '-units]:not(:checked)').data('typeValue'), //the newly selected option
            off = $('[name=' + elementName + '-units]:checked').data('typeValue'); //the original option, from which to convert

        convertUnits(on, off);

        var customSpecs = {
            heightFt: $('#' + elementName + '-item-height-feet').val(),
            heightIn: $('#' + elementName + '-item-height-inches').val(),
            widthFt: $('#' + elementName + '-item-width-feet').val(),
            widthIn: $('#' + elementName + '-item-width-inches').val(),
            lengthFt: $('#' + elementName + '-item-length-feet').val(),
            lengthIn: $('#' + elementName + '-item-length-inches').val(),
            attWidthFt: $('#' + elementName + '-item-attwidth-feet').is(':visible') ? $('#' + elementName + '-item-attwidth-feet').val() : 0,
            attWidthIn: $('#' + elementName + '-item-attwidth-inches').is(':visible') ? $('#' + elementName + '-item-attwidth-inches').val() : 0,
            angledAttWidthFt: $('#' + elementName + '-item-angattwidth-feet').is(':visible') ? $('#' + elementName + '-item-angattwidth-feet').val() : 0,
            angledAttWidthIn: $('#' + elementName + '-item-angattwidth-inches').is(':visible') ? $('#' + elementName + '-item-angattwidth-inches').val() : 0,
            weight: $('#' + elementName + '-item-weight').val().replace(',', '')
        };

        if (!customSpecs.weight) {
            showError('Please enter the weight of your item. We cannot provide an automated estimate without at least weight.');
        }

        for (var key in customSpecs) {
            if (customSpecs[key] === "") {
                customSpecs[key] = 0;
            }
        }

        var specsError = "";
        var combinedSpecsError = "Due to a combination of features, this item is likely to require additional permits and/or escort(s). We are unable to deliver an automated estimate. Please email <a href='mailto:support@veritread.com'>support@veritread.com</a> to receive a quote within 1-4 business hours, or call <strong>+1-800-880-0468</strong>. We are very sorry for this inconvenience.";
        if ((parseInt(customSpecs.widthFt) + parseInt(customSpecs.widthIn / 12)) > 12 ||
            (parseInt(customSpecs.attWidthFt) + parseInt(customSpecs.attWidthIn / 12)) > 12 ||
            (parseInt(customSpecs.angledAttWidthFt) + parseInt(customSpecs.angledAttWidthIn / 12)) > 12) {
            specsError = "Due to the width of this item, additional permits and/or escort(s) could be required. We are unable to deliver an automated estimate. Please email <a href='mailto:support@veritread.com'>support@veritread.com</a> to receive a quote within 1-4 business hours, or call <strong>+1-800-880-0468</strong>. We are very sorry for this inconvenience.";
        }
        if (customSpecs.weight > 80000) {
            if (specsError !== "")
                specsError = combinedSpecsError;
            else
                specsError = "Due to the weight of this item, additional permits and/or escort(s) could be required. We are unable to deliver an automated estimate. Please email <a href='mailto:support@veritread.com'>support@veritread.com</a> to receive a quote within 1-4 business hours, or call <strong>+1-800-880-0468</strong>. We are very sorry for this inconvenience.";
        }
        if ((parseInt(customSpecs.heightFt) + parseInt(customSpecs.heightIn / 12)) > 13) {
            if (specsError !== "")
                specsError = combinedSpecsError;
            else
                specsError = "Due to the height of this item, additional permits and/or escort(s) could be required. We are unable to deliver an automated estimate. Please email <a href='mailto:support@veritread.com'>support@veritread.com</a> to receive a quote within 1-4 business hours, or call <strong>+1-800-880-0468</strong>. We are very sorry for this inconvenience.";
        }
        if ((parseInt(customSpecs.lengthFt) + parseInt(customSpecs.lengthFt / 12)) > 50) {
            if (specsError !== "")
                specsError = combinedSpecsError;
            else
                specsError = "Due to the length of this item, additional permits and/or escort(s) could be required. We are unable to deliver an automated estimate. Please email <a href='mailto:support@veritread.com'>support@veritread.com</a> to receive a quote within 1-4 business hours, or call <strong>+1-800-880-0468</strong>. We are very sorry for this inconvenience.";
        }
        if (limitAllowedSpecs && specsError !== "") {
            showError(specsError);
            $(elementToUse + ' .vt-updating').remove();
            return;
        }

        $('.vt-alert-error').hide();

        if (toState.length > 2)
            toState = capitalize(toState);
        else
            toState = toState.toUpperCase();

        toCity = capitalize(toCity);

        var dataToSend = {
            Make: make,
            Model: model,
            fromZip: fromZip,
            fromCity: fromCity,
            fromState: fromState,
            Origin: fromCountry,
            toZip: toZip,
            toCity: toCity,
            toState: toState,
            Destination: toCountry,
            heightFt: customSpecs.heightFt,
            heightIn: customSpecs.heightIn,
            widthFt: customSpecs.widthFt,
            widthIn: customSpecs.widthIn,
            lengthFt: customSpecs.lengthFt,
            lengthIn: customSpecs.lengthIn,
            attWidthFt: customSpecs.attWidthFt,
            attWidthIn: customSpecs.attWidthIn,
            angledAttWidthFt: customSpecs.angledAttWidthFt,
            angledAttWidthIn: customSpecs.angledAttWidthIn,
            weight: customSpecs.weight
        };

        $.ajax({
            url: apiUrl,
            dataType: 'jsonp',
            jsonp: 'callback',
            data: dataToSend,
            timeout: 20000,
            error: function (x, t, m) {
                if (t === "timeout") {
                    if (retries.vt < 3) {
                        retries.vt++;
                        getEstimate();
                    } else {
                        retries.vt = 0;
                        showError("We are unable to process this request at this time. We apologize for this inconvenience; please try back again later.");
                        $(elementToUse + ' .vt-updating').remove();
                    }
                }
            },
            success: function (data) {
                retries.vt = 0;
                // console.log(data);

                updatePostButton();
                if (data.errorCode !== "OK" || data.adjustedactualprice === "" || data.adjustedactualprice === "0") {
                    var errMsg = data.errorMessage;
                    if (data.errorMessage === "") {
                        // errMsg = "Sorry, VeriTread could not provide an automated estimate.";
                    }
                    else if (data.errorCode === "NO_HIST_DATA") {
                        // errMsg = "Due to reasons outside our control, we are unable to deliver an automated estimate for this " + make + " " + model + " delivering to " + toCity + ", " + toState + ". We are very sorry for this inconvenience.<br />";
                    }
                    showNoEstimateError();
                    // showError(errMsg);
                    $(elementToUse + ' .vt-estimator-results').hide();
                }
                else {
                    // if (false && 'ontouchstart' in window) {
                        // location.hash = "#vt-estimate-slider-container";
                    // }

                    baseEstimate = data.adjustedactualprice;
                    updateEstimatorDisplay(data.adjustedactualprice, data.estimatedistance);
                    updatePostButton();
                    // $(elementToUse + ' .vt-estimator-results').show();
                    showEstimatorResults();
                }

                $(elementToUse + ' .vt-updating').remove();
            },
            failure: function () {
                showError("Sorry, we could not get an estimated freight value at this time.");
                $(elementToUse + ' .vt-updating').remove();
            }
        });
    }

    function convertUnits(on, off) {
        var convertI = $('[data-type=' + off + ']'),
            rel, relF, relI, l, k, inc, dim, i, f, v, fi, m;

        $.each( convertI, function( i, x ) {
          if( $(x).hasClass( 'vt-weight-field' ) )
          {
            if( off === "english" && validateInt( $(x).val() ) )
            {
              rel = $(x).data('relatedKg');
              l   = $(x).val().replace(',', '');
              k   = convertPoundsToKilos( parseInt( l ) );
              $(rel).val(k);
            }
            else if( off === "metric" && validateFloat( $(x).val() ) )
            {
              rel = $(x).data('relatedLb');
              k   = parseFloat( $(x).val() );
              l   = convertKilosToPounds( k );
              $(rel).val(l);
            }
            weight.english = l;
            weight.metric = k;
          }
          else
          {
            //deal only with the feet fields, grab the inches within the processing
            if( off === "english" && $(x).attr('id').indexOf('feet') !== -1 )
            {
              rel = $(x).data('relatedMeters');
              inc = $(x).data('relatedMeasure');
              dim = $(x).data('dimension');
              f   = validateInt( $(x).val() ) ? parseInt( $(x).val() ) : 0;
              i   = validateInt( $(inc).val() ) ? parseInt( $(inc).val() ) : 0;

              if( i > 0 || f > 0 )
              {
                v  = convertFeetToMeters( f, i );
                $(rel).val(v);
              }
            }
            else if( off === "metric" && $(x).attr('id').indexOf('meters') !== -1 )
            {
              relF = $(x).data('relatedFeet');
              relI = $(x).data('relatedInches');
              dim = $(x).data('dimension');
              m    = parseFloat( $(x).val() );
              if( m )
              {
                fi = convertMetersToFeet(m);
                $(relF).val(fi.feet);
                $(relI).val(fi.inches);
              }
            }
          }
        });
      }

    function setSchematicImage(data) {
        if (data.schematicURL !== "")
        {
            var schematicUrl = data.schematicURL.replace('http://', '//');
            schematicUrl = schematicUrl.replace('https://', '//');
            $(elementToUse + ' .vt-schematic').html('<img src="' + schematicUrl + '" alt="Schematic for ' + make + ' ' + model + '" class="schematic" />');
        }
      }

    function initUi() {
        initPointer();
      }

    function initVideo(videoUrl) {
      }

    function toggleVideo() {
      }

    function initPointer() {
        pointer.isDragging = false;
        pointer.wasDragging = false;

        pointer.offsetX = $(elementToUse + ' .vt-average-pointer').offset().left;
        pointer.width = $(elementToUse + ' .vt-average-pointer').height();

        if ('ontouchstart' in window) {
            $('.vt-average-pointer').bind('touchstart', function (e) {

                $('.vt-average-pointer').bind('touchmove', function (e) {
                    e.preventDefault();

                    if (!pointer.isDragging) {
                        //pointer.initialMousePosY = e.pageY;
                        //pointer.offsetY = $(elementToUse + ' .vt-average-pointer').offset().top;
                        //pointer.frameHeight = $(elementToUse + ' .vt-estimator .vt-grad').height();
                        //pointer.frameTop = $(elementToUse + ' .vt-estimator .vt-grad').offset().top;
                        //pointer.frameBottom = pointer.frameTop + pointer.frameHeight;

                        pointer.initialMousePosX = e.originalEvent.touches[0].pageX;
                        pointer.offsetX = $(elementToUse + ' .vt-average-pointer').offset().left;
                        pointer.frameWidth = $(elementToUse + ' .vt-estimator .vt-grad').width();
                        pointer.frameLeft = $(elementToUse + ' .vt-estimator .vt-grad').offset().left;
                        pointer.frameRight = pointer.frameleft + pointer.frameWidth;
                    }
                    // var deltaY = e.pageY - pointer.frameTop;
                    // var percent = Math.floor(( deltaY / pointer.frameHeight ) * 1000) / 10;
                    var deltaX = e.originalEvent.touches[0].pageX - pointer.frameLeft;
                    var percent = Math.floor((deltaX / pointer.frameWidth) * 1000) / 10;

                    var margin = 3;
                    if (percent >= (100 - margin))
                        percent = 100 - margin - 0.01;
                    else if (percent <= margin)
                        percent = margin - '0.01';

                    //var cssTopPointer = percent + '%';
                    //var cssTopBox = (percent + 5) + '%';
                    var cssLeftPointer = percent + '%';
                    // var cssLeftBox = (percent + 5) + '%';
                    $(elementToUse + ' .vt-average-pointer').css('left', cssLeftPointer);
                    // $(elementToUse + ' .estimate-cost-and-distance').css('left', cssLeftBox);

                    var factorPercent = percent; // 100 - percent;
                    var factor = ((factorPercent * 40 / 100) + 80) / 100;
                    var adjustedPrice = formatNumber((factor * baseEstimate).toFixed(0));
                    $(elementToUse + ' .vt-estimate-price').html(adjustedPrice);

                    var timeframe = '6-7';
                    if (factorPercent >= 75) {
                        timeframe = '1-2';
                    }
                    else if (factorPercent >= 50) {
                        timeframe = '3-4';
                    }
                    else if (factorPercent >= 25) {
                        timeframe = '5-6';
                    }

                    $(elementToUse + '.vt-estimate-timeframe').html(timeframe);
                    pointer.isDragging = true;
                });
            });

            $('.vt-average-pointer').bind('touchend', function (e) {
                pointer.wasDragging = pointer.isDragging; // isPointerDragging;
                pointer.isDragging = false;
                $(window).unbind("touchstart");
            });
        } else {
            $(elementToUse + ' .vt-average-pointer').mousedown(function (e) {
                $(document).mousemove(function (e) {
                    if (!pointer.isDragging) {
                        //pointer.initialMousePosY = e.pageY;
                        //pointer.offsetY = $(elementToUse + ' .vt-average-pointer').offset().top;
                        //pointer.frameHeight = $(elementToUse + ' .vt-estimator .vt-grad').height();
                        //pointer.frameTop = $(elementToUse + ' .vt-estimator .vt-grad').offset().top;
                        //pointer.frameBottom = pointer.frameTop + pointer.frameHeight;

                        pointer.initialMousePosX = e.pageX;
                        pointer.offsetX = $(elementToUse + ' .vt-average-pointer').offset().left;
                        pointer.frameWidth = $(elementToUse + ' .vt-estimator .vt-grad').width();
                        pointer.frameLeft = $(elementToUse + ' .vt-estimator .vt-grad').offset().left;
                        pointer.frameRight = pointer.frameleft + pointer.frameWidth;
                    }
                    // var deltaY = e.pageY - pointer.frameTop;
                    // var percent = Math.floor(( deltaY / pointer.frameHeight ) * 1000) / 10;
                    var deltaX = e.pageX - pointer.frameLeft;
                    var percent = Math.floor((deltaX / pointer.frameWidth) * 1000) / 10;

                    var margin = 3;
                    if (percent >= (100 - margin))
                        percent = 100 - margin - 0.01;
                    else if (percent <= margin)
                        percent = margin - '0.01';

                    //var cssTopPointer = percent + '%';
                    //var cssTopBox = (percent + 5) + '%';
                    var cssLeftPointer = percent + '%';
                    // var cssLeftBox = (percent + 5) + '%';
                    $(elementToUse + ' .vt-average-pointer').css('left', cssLeftPointer);
                    // $(elementToUse + ' .vt-estimate-cost-and-distance').css('left', cssLeftBox);

                    var factorPercent = percent; // 100 - percent;
                    var factor = ((factorPercent * 40 / 100) + 80) / 100;
                    var adjustedPrice = formatNumber((factor * baseEstimate).toFixed(0));
                    $(elementToUse + ' .vt-estimate-price').html(adjustedPrice);

                    var timeframe = '6-7';
                    if (factorPercent >= 75) {
                        timeframe = '1-2';
                    }
                    else if (factorPercent >= 50) {
                        timeframe = '3-4';
                    }
                    else if (factorPercent >= 25) {
                        timeframe = '5-6';
                    }

                    $(elementToUse + ' .vt-estimate-timeframe').html(timeframe);
                    pointer.isDragging = true;
                });
            });
            $(document).mouseup(function (e) {
                pointer.wasDragging = pointer.isDragging; // isPointerDragging;
                pointer.isDragging = false;
                $(document).unbind("mousemove");
            });
        }

    }

    function showPlaceholder() {
        $(elementToUse + ' .vt-bad-lookup').show();
        $('.vt-specs-and-inputs').hide();
        hideEstimatorResults();
      }

    function showEstimator() {
        $(elementToUse + ' .vtestimator').show();
        $(elementToUse + ' .vt-specs-and-inputs').show();
        $(elementToUse + ' .vt-col2').show();
        $(elementToUse + ' .vt-bad-lookup').hide();
      }

    function showEstimatorResults() {
        $(elementToUse + ' .vt-estimate-slider').show();
        $(elementToUse + ' .vt-estimator-results').show();
        $(elementToUse + ' .vt-results-block').show();
        $(elementToUse + ' .vt-estimate-cost').show();

        jumpTo('.vt-results');
    }

    function hideEstimatorResults() {
        $('.vt-estimate-slider').hide();
        $('.vt-results-block').hide();
    }

    function updatePostButton() {
        var postUrl = getPostUrl();
        $(elementToUse + ' .vt-post-link a').attr('href', postUrl);
      }

    function updateEstimatorDisplay(price, distance) {
        if (price !== "" && price !== "0")
        {
          $(elementToUse + ' .vt-estimate-price').html(formatNumber(price));
          var highest = 1.149 * price;
          var higher = 1.048 * price;
          var lower = 0.930 * price;
          var lowest = 0.830 * price;
          $(elementToUse + ' .vt-pointer-highest').html('$' + formatNumber(highest.toFixed(0)));
          $(elementToUse + ' .vt-pointer-higher').html('$' + formatNumber(higher.toFixed(0)));
          $(elementToUse + ' .vt-pointer-lower').html('$' + formatNumber(lower.toFixed(0)));
          $(elementToUse + ' .vt-pointer-lowest').html('$' + formatNumber(lowest.toFixed(0)));
        }
        if (distance !== "")
        {
          $(elementToUse + ' .vt-estimate-distance').html(distance);
          $(elementToUse + ' .vt-estimate-distance-container').show();
        }
        else
        {
          $(elementToUse + ' .vt-estimate-distance-container').hide();
        }

        $(elementToUse + ' .vt-estimate-timeframe').html('3-5');
      }

    function clearSpecs() {
        $('#' + elementName + '-units-english').prop('checked', true);

        $('#' + elementName + '-item-length-feet').val('');
        $('#' + elementName + '-item-length-inches').val('');
        $('#' + elementName + '-item-width-feet').val('');
        $('#' + elementName + '-item-width-inches').val('');
        $('#' + elementName + '-item-height-feet').val('');
        $('#' + elementName + '-item-height-inches').val('');
        $('#' + elementName + '-item-attwidth-feet').val('');
        $('#' + elementName + '-item-attwidth-inches').val('');
        $('#' + elementName + '-item-angledattwidth-feet').val('');
        $('#' + elementName + '-item-angledattwidth-inches').val('');
        $('#' + elementName + '-item-weight').val('');
      }

    function setDisplayForSingleSourceDimensions() {
      isMultiSourceSpecs = false;
      $(elementToUse + ' .vt-dimensions-keys').hide();
      $(elementToUse + ' .vt-default-disclaimer').show();
    }

    function setSpecs(data, source, override) {

      var fieldList = new Array("length", "width", "height", "attwidth", "angattwidth");
      for (var i = 0; i < fieldList.length; i++)
      {
        var feetId = '#' + elementName + '-item-' + fieldList[i] + '-feet',
            inchesId = '#' + elementName + '-item-' + fieldList[i] + '-inches',
            fieldName = fieldList[i],
            isFieldSet = false;
        fieldName = fieldName=='attwidth' ? 'attWidth' : fieldName;
        fieldName = fieldName=='angattwidth' ? 'angAttWidth' : fieldName;

        var feetValue = $(feetId).val();
        var inchesValue = $(inchesId).val();
        if ($(feetId).val() || $(inchesId).val()) {
          isFieldSet = true;
        }

        if (override || !isFieldSet) {
          if (data[fieldName + 'Ft']) {
            $(feetId).val(data[fieldName + 'Ft']);
            if (isMultiSourceSpecs) {
              $('.vt-label.vt-dim-' + fieldList[i]).addClass('vt-dim-' + source);
            }
          }
          if (data[fieldName + 'In']) {
            $(inchesId).val(data[fieldName + 'In']);
            if (isMultiSourceSpecs) {
              $('.vt-label.vt-dim-' + fieldList[i]).addClass('vt-dim-' + source);
            }
          }

          if ($(feetId).val() && !$(inchesId).val())
          {
            $(inchesId).val("0");
          }
        }
      }

      $(elementToUse + ' .vt-dim-attwidth').show();
      if ( validatePresenceOf(data.hasAttachment) && data.hasAttachment === false )
      {
        $(elementToUse + ' .vt-dim-attwidth').hide();
      }
      $(elementToUse + ' .vt-dim-angattwidth').show();
      if ( validatePresenceOf(data.hasAngledWidthOfattachment) && data.hasAngledWidthOfattachment === false )
      {
        $(elementToUse + ' .vt-dim-angattwidth').hide();
      }

      if (data.weight)
      {
        $('#' + elementName + '-item-weight').val(formatNumber(data.weight));
        if (isMultiSourceSpecs) {
          $('.vt-label.vt-dim-weight').addClass('vt-dim-' + source);
        }
      }

    }

    function capitalize(text) {
        var split = text.toLowerCase().split(' ');

        for (var i = 0, len = split.length; i < len; i++) {
            split[i] = split[i].charAt(0).toUpperCase() + split[i].slice(1);
        }

        return split.join(' ');
      }

    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      }

    function convertFeetToMeters(feet, inches) {
        var feetDecimal = feet + inches/12;
        return (feetDecimal * METERS_PER_FOOT).toFixed(5);
      }

    function convertMetersToFeet(meters) {
        var feetDecimal = meters * FEET_PER_METER;
        var feet = Math.floor(feetDecimal);
        var inches = ((feetDecimal % 1) * 12).toFixed(0);
        return { 'feet': feet, 'inches': inches };
      }

    function convertPoundsToKilos(pounds) {
        return (pounds * KILOS_PER_POUND).toFixed(0);
      }

    function convertKilosToPounds(kilos) {
      return (kilos * POUNDS_PER_KILO).toFixed(0);
    }

    function convertFeetInchesToFeetDecimal( feet, inches ) {
      return (feet + inches/12);
    }

    function validateInt( i ) {
      //return true or false instead of NaN and val
      return parseInt(i) ? true : false;
    }

    function validateFloat( f ) {
      //return true or false instead of NaN and val
      return parseFloat(f) ? true : false;
    }

    function validatePresenceOf( x ) {
      return typeof x === "undefined" ? false : x === null ? false : x.length < 1 ? false : true;
    }

    function isUsZipCodeFragment(code) {
        var regex = /^([0-9]{1,4})$/,
            match = regex.exec(code);
        return match;
    }

    function isMxPostalCodeFragment(code) {
        var regex = /^[0-9]{1,3}$/,
            match = regex.exec(code);
        return match;
    }

    function validateCanadianPostalCode(code) {
      var regex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
          match = regex.exec(code);
      return match;
    }

    function validateUsZipCode(code) {
      var regex = /^([0-9]{5})(?:[-\s]*([0-9]{4}))?$/,
          match = regex.exec(code);
      return match;
    }

    function validateMexicanPostalCode(code) {
      var regex = /^([0-9]{5})?$/,
          match = regex.exec(code);
      return match;
    }

    function hideError() {
        $(elementToUse + ' .vt-errorMsg').hide();
        $(elementToUse + ' .vt-no-estimate-error').hide();
    }
    function showError(error) {
      var postUrl = getPostUrl(),
          errorText = '';

      if (typeof error === 'object') {
        errorText = '<p class="vt-alert-heading">' + error.heading + '</p>';
        for (var i=0 ; i < error.contents.length ; i++) {
          errorText += '<p class="vt-alert-contents">' + error.contents[i] + '</p>';
        }
      } else {
        errorText = error;
      }
      $(elementToUse + ' .vt-errorMsg .vt-msg').html(errorText); // ,elementToUse + ' .errorMsg'
      if(! $(elementToUse + ' .vt-errorMsg').is(":visible") )
          $(elementToUse + ' .vt-errorMsg').slideToggle();
      hideEstimatorResults();
      $('.vt-load-advisor').show();
    }
    function showNoEstimateError() {
      var postUrl = getPostUrl();

      showError({
        heading: noEstimate.heading,
        contents: noEstimate.contents
      });

      $('.vt-error-1').html(noEstimate.error1);
      $('.vt-error-2').html(noEstimate.error2);
      $('.vt-error-link').html('<p class="vt-estimator-results-link vt-post-link"><a href="' + postUrl + '" target="_blank" class="vt-button">' + noEstimate.button + '</a></p>');

      $('.vt-load-advisor').hide();
      $('.vt-results').show();
      $('.vt-no-estimate-error').show();

      jumpTo('.vt-no-estimate-error');
    }
    function jumpTo(el) {
      if ($(el).length) {
        var jumpToTop = $(el).offset().top;
        window.scrollTo(0, jumpToTop);
      }
    }

    estimator.create = function(item) {
        make = item.make;
        model = item.model;
        fromCountry = item.originCountryISO || '';
        fromCountryISO = item.originCountryISO || '';
        fromCity = item.originCity || '';
        fromState = item.originState || '';
        fromZip = item.originPostal || '';
        toCountry = item.deliveryCountryISO || '';
        toCountryISO = item.deliveryCountryISO || '';
        toCity = item.deliveryCity || '';
        toState = item.deliveryState || '';
        toZip = item.deliveryPostal || '';
        catId = item.catId || '';

        elementToUse = item.element;
        elementName = elementToUse.substr(1, elementToUse.length);
        assetsDir = item.assetsDir;
      };
    estimator.renderDirectly = function (item) {
        render();

        setOriginLocation();
        setDeliveryLocation(item);

        clearSpecs();
        if (item.specs) {
          isMultiSourceSpecs = true;
          setSpecs(item.specs, 'local', true);
          convertUnits('metric', 'english');
          convertUnits('english', 'metric');
        } else {
          setDisplayForSingleSourceDimensions();
        }

        if (fromCountryISO !== '' && VALID_COUNTRIES.indexOf(fromCountryISO >= 0)) {
          $(elementToUse + ' .vt-pickup-country').val(fromCountryISO);
        }
        if (fromCity !== '' || fromState !== '' || fromZip !== '') {
          var defaultPickupLoc = '';
          if (fromCity !== '') {
            defaultPickupLoc += fromCity;
          }
          if (fromState !== '') {
            defaultPickupLoc += (defaultPickupLoc !== '') ?
              ', ' + fromState :
              fromState;
          }
          if (fromZip !== '') {
            defaultPickupLoc += ' ' + fromZip;
          }
          $(elementToUse + ' .vt-pickup-location').val(defaultPickupLoc.trim());
          lookUpPickupLocation();
        }

        if (toCountryISO !== '' && VALID_COUNTRIES.indexOf(toCountryISO >= 0)) {
          $(elementToUse + ' .vt-pickup-country').val(toCountryISO);
        }
        if (toCity !== '' || toState !== '' || toZip !== '') {
          var defaultDeliveryLoc = '';
          if (toCity !== '') {
            defaultDeliveryLoc += toCity;
          }
          if (toState !== '') {
            defaultDeliveryLoc += (defaultDeliveryLoc !== '') ?
              ', ' + toState :
              toState;
          }
          if (toZip !== '') {
            defaultDeliveryLoc += ' ' + toZip;
          }
          $(elementToUse + ' .vt-pickup-location').val(defaultDeliveryLoc.trim());
          lookUpPickupLocation();
        }

        $(elementToUse + ' .vt-pickup-location').blur(function () {
            lookUpPickupLocation();
        });
        $(elementToUse + ' .vt-delivery-location').blur(function () {
            lookUpDeliveryLocation();
        });

        $(elementToUse + ' .vt-pickup-location').focus();

        $('.vt-item-details').show();
        $('.vt-pickup-location').focus();
        $('.vt-alternate-listing').hide();
      };

    return estimator;

  }); //();

  var setupEnvironment = function () {
    if (env === 'staging') {
      apiUrl = '//staging.vtapi.veritread.com/api/Estimator';
      postBaseUrl = 'http://staging.veritread.com/postaload/makeandmodel.aspx';
    } else if (env === 'dev') {
      apiUrl = '//devvtapi.veritread.com/api/Estimator';
      postBaseUrl = 'https://www.veritread.com/postaload/makeandmodel.aspx';
  }

    if (embedCss) {
      document.write('<link rel="stylesheet" href="' + assetsDir + 'css/main.css">');
    }

    $(elementToUse + ' .vtestimator').show();
    $(elementToUse + ' .vtplaceholder').hide();

  };

  var createItem = function (itemOptions) {
    var estimator = new Estimator();
    estimator.create(itemOptions);
    estimator.renderDirectly(itemOptions);

    items.push(estimator);
  };

  app.prototype = {
    addItem: function(itemOptions) {
      var vtElement = 'vtcustom1';
      document.write('<div class="' + vtElement + '"></div>');

      itemOptions.assetsDir = assetsDir;
      itemOptions.element = '.' + vtElement;

      createItem(itemOptions);
    },
    addItemToElement: function(element, itemOptions) {
      itemOptions.assetsDir = assetsDir;
      itemOptions.element = element;

      createItem(itemOptions);
    },
    loadItem: function (element, itemOptions) {
        itemOptions.element = element;

        createItem(itemOptions);
    }
  };

  return app;

})();
