var VTTemplates = (function (pId) {
    var app = function () {
        return { insert: insertMain };
    };

    var templates = {}
        templateData = {},
        partnerId = pId || 1,
        partners = [],
        partnerSettings = {},

        DEFAULT_VIDEO_URL =  '//www.youtube.com/embed/LJNYtaVS7uM';

    var loadPartnerSettings = function () {
        var standardOneCol = {
            estimateButton: 'EstimateButton',
            footer: 'Footer',
            header: 'Header',
            col1Class: 'vt-specs-and-inputs',
            col1ClassWithCol2: 'vt-col1',
            col2: 'Column2',
            loadAdvisor: 'LoadAdvisor',
            noEstimate: 'NoEstimate',
            results: 'Results',
            useCol2: false,
            wide: false
        };
        var standardTwoCol = {
            estimateButton: 'EstimateButton',
            footer: 'Footer',
            header: 'HeaderDetailed',
            col1Class: 'vt-specs-and-inputs',
            col1ClassWithCol2: 'vt-col1',
            col2: 'Column2',
            loadAdvisor: 'LoadAdvisor',
            noEstimate: 'NoEstimate',
            results: 'Results',
            useCol2: true,
            wide: false
        };

        partners[4] = standardTwoCol;
        partners[4].wide = true;
        partners[4].useVideo = true;

        partners[14] = standardOneCol;
        partners[14].header = 'HeaderDetailed';

        partnerSettings = partners[partnerId];
    };

    var initialize = function () {
        loadPartnerSettings();
        initializeTemplates();
    };

    var initializeTemplates = function() {
        var headerTemplate = useTemplate(partnerSettings.header),
            footerTemplate = useTemplate(partnerSettings.footer),
            col1Class = partnerSettings.col1Class,
            col2Template = '',
            resultsTemplate = '',
            noEstimateTemplate = useTemplate(partnerSettings.noEstimate),
            loadAdvisorTemplate = useTemplate(partnerSettings.loadAdvisor),
            estimateButtonTemplate = useTemplate(partnerSettings.estimateButton),
            extraFormClass = '';

        if (partnerSettings.useCol2) {
            var videoLink = '';
            if (partnerSettings.useVideo) {
                videoLink = '<p class="vt-header2 vt-video-container"><a class="vt-video" href="' + DEFAULT_VIDEO_URL + '" target="_blank">How It Works</a></p>';
            }
          col2Template = useTemplate(partnerSettings.col2, { videoLink: videoLink });
          col1Class += ' ' + partnerSettings.col1ClassWithCol2;

          loadAdvisorTemplate = '';
        } else {
          resultsTemplate = useTemplate(partnerSettings.results);
        }

        if (partnerSettings.wide) {
            extraFormClass = ' vt-wide';
        }

        templateData = {
            header: headerTemplate,
            footer: footerTemplate,
            col1Class: col1Class,
            col2: col2Template,
            results: resultsTemplate,
            noEstimate: noEstimateTemplate,
            loadAdvisor: loadAdvisorTemplate,
            estimateButton: estimateButtonTemplate,
            extraFormClass: extraFormClass
        };
    };

    var insertMain = function (parms, pId) {
        partnerId = pId;
        initialize();

        parms = mergeOptions(templateData, parms);
        return useTemplate('Main', parms);
    };

    var useTemplate = function (templateName, parms) {
        var output = '';

        if (templates.hasOwnProperty(templateName)) {
          output = templates[templateName].join("\n");
          if (typeof parms === 'object') {
            for (var parm in parms) {
              var regex = new RegExp('{{' + parm + '}}', "g");
              output = output.replace(regex, parms[parm]);
            }
          }
        }

        return output;
    };

    var mergeOptions = function (opts, parms){
        var merged = {};

        for (var attrname in opts) { merged[attrname] = opts[attrname]; }
        for (var attrname in parms) { merged[attrname] = parms[attrname]; }

        templateData = merged;

        return merged;
    }

    templates.Results =
    [   '          <div class="vt-results">',
        '            <section class="vt-errorMsg vt-alert vt-alert-error vt-hide">',
        '                <button type="vt-button" class="vt-close" data-dismiss=".vt-alert"><span>&#215;</span></button>',
        '                <span class="vt-msg"></span>',
        '            </section>',
        '            <section class="vt-estimate-cost vt-results-block" style="display:none;">',
        '              <div class="vt-estimate-cost-and-distance">',
        '                <div class="vt-heading">',
        '                    <img src="veritread/img/veritread-logo2.png" alt="VeriTread" class="vt-logo" /> Estimate',
        '                </div>',
        '                <h1><span class="vt-estimate-currency">$</span><span class="vt-estimate-price"></span></h1>',
        '                <span class="vt-timeframe-container">Picked up in <span class="vt-estimate-timeframe"></span> days</span><br />',
        '                <span class="vt-estimate-distance-container">Distance: <span class="vt-estimate-distance"></span> miles</span>',
        '',
        '                <p class="vt-estimator-results-link vt-post-link">',
        '                  <a href="https://www.veritread.com/postaload/makeandmodel.aspx?Mode=QP" class="vt-button" target="_blank">List Your Shipment</a>',
        '                </p>',
        '              </div><!--/.estimate-cost-and-distance-->',
        '            </section>',
        '          </div><!--/.vt-results-->',
    ];

    templates.EstimateButton =
    [
      '<div class="vt-get-estimate"><button class="vt-get-estimate-button">Get Estimate</button></div>'
    ];

    templates.LoadAdvisor =
    [  '<section class="vt-load-advisor vt-results-block" style="display:none;">',
        '  <ul class="vt-bullets">',
        '    <li class="vt-bullet" style="list-style-image: url(\'{{assetsDir}}/img/vt-bullet.png\');">Get Freight Specs and Instant Estimates</li>',
        '    <li class="vt-bullet" style="list-style-image: url(\'{{assetsDir}}/img/vt-bullet.png\');">Get Qualified Bids from Trustworthy Transporters</li>',
        '    <li class="vt-bullet" style="list-style-image: url(\'{{assetsDir}}/img/vt-bullet.png\');">Select a Transporter and Directly Communicate</li>',
        '  </ul>',
        '</section>'
    ];

    templates.NoEstimate =
    [   '<section class="vt-no-estimate-error" style="display:none;">',
        '  <p class="vt-error-1">Unfortunately we are not comfortable providing an automated shipping estimate for this item.</p>',
        '  <p class="vt-error-2">Please list this item on VeriTread and receive Free, no-obligation freight quotes from qualified transportation companies.</p>',
        '  <div class="vt-error-link"></div>',
        '</section>'
    ];

    templates.Header =
    [  '<div class="vtbranding vt-header-1"><a href="http://www.veritread.com/" target="_blank"><img src="veritread/img/veritread-logo1.png" alt="VeriTread" class="vt-logo" /></a> Shipping Estimator</div>'
    ];

    templates.HeaderDetailed =
    [  '<div class="vtbranding vt-header-2"><a href="http://www.veritread.com/" target="_blank">Get Accurate Freight Quotes &amp; Qualified Bids Using <img src="veritread/img/veritread-logo2.png" alt="VeriTread" class="vt-logo" /></a></div>'
    ];

    templates.Footer =
    [  '<div class="vtfooter vt-footer-1"><div class="vt-footer-col1"><a href="http://www.veritread.com">Learn More at VeriTread.com</a></div><div class="vt-footer-col2">1-800-880-0468</div></div>'
    ];

    templates.Footer3Col =
    [  '<div class="vtfooter vt-footer-2"><table class="vtfooter-info"><tr><td class="vtfooter-text"><span class="line1">Get Freight Specs</span><span class="line2">and Instant Estimates</span></td><td class="vtfooter-text"><span class="line1">Get Qualified Bids from</span><span class="line2">Trustworthy Transporters</span></td><td class="vtfooter-text"><span class="line1">Select a Carrier and</span><span class="line2">Directly Communicate</span></td><td class="vtfooter-contact">1-800-880-0468</td></tr></table></div>'
    ];

    templates.Footer3ColNarrow =
    [  '<div class="vtfooter vt-footer-2 vt-narrow"><table class="vtfooter-info"><tr><td class="vtfooter-text"><span class="line1">Get Freight Specs</span><span class="line2">and Instant Estimates</span></td><td class="vtfooter-text"><span class="line1">Get Qualified Bids from</span><span class="line2">Trustworthy Transporters</span></td><td class="vtfooter-text"><span class="line1">Select a Carrier and</span><span class="line2">Directly Communicate</span></td><td class="vtfooter-contact">1-800-880-0468</td></tr></table></div>'
    ];

    templates.Column2 =
    [   '<div class="vt-col2" style="display:none;">',
        '  <section class="vt-about">',
        '    <p class="vt-header1">Why Get Bids with VeriTread?</p>',
        '    <p class="vt-header2">Save Money</p>',
        '    <p class="vt-blurb">Get multiple competitive bids.</p>',
        '    <p class="vt-header2">Industry Leading Transportation Providers</p>',
        '    <p class="vt-blurb">Read feedback &amp; view never before seen details.</p>',
        '    <p class="vt-header2">It Is Fast &amp; Easy</p>',
        '    <p class="vt-blurb">List your shipment for free.</p>',
        '    {{videoLink}}',
        '    <p class="vt-about-footer">',
        '      <a href="http://www.veritread.com/" class="vt-about-footer-link" target="_blank">Learn More at VeriTread.com</a>',
        '    </p>',
        '  </section>',
        '  <section class="vt-errorMsg vt-alert vt-alert-error vt-hide">',
        '    <button type="button" class="vt-close" data-dismiss=".vt-alert"><span>&#215;</span></button>',
        '    <span class="vt-msg"></span>',
        '  </section>',
        '  <section class="vt-estimate-cost" style="display:none;">',
        '    <div class="vt-estimate-cost-and-distance">',
        '      <div class="vt-heading">',
        '        <img src="veritread/img/veritread-logo2.png" alt="VeriTread" class="vt-logo" /> Estimate',
        '    </div>',
        '    <h1><span class="vt-estimate-currency">$</span><span class="vt-estimate-price"></span></h1>',
        '    <span class="vt-timeframe-container">Picked up in <span class="vt-estimate-timeframe"></span> days</span><br />',
        '    <span class="vt-estimate-distance-container">Distance: <span class="vt-estimate-distance"></span> miles</span>',
        '    <p class="vt-estimator-results-link vt-post-link">',
        '      <a href="https://www.veritread.com/postaload/makeandmodel.aspx?Mode=QP" class="vt-button" target="_blank">List Shipment</a>',
        '    </p>',
        '  </div><!--/.vt-estimate-cost-and-distance-->',
        '</section></div><!--/.vt-col2-->'
    ];

    templates.Main =
    [   '  <form class="veritread-form{{extraFormClass}}">',
        '    <div class="veritread-main">',
        '{{header}}',
        '        <div class="vtestimator vt-clearfix">',
        '          <div class="vt-bad-lookup">',
        '            <p>List your item to VeriTread and receive free, no-obligation freight quotes.</p>',
        '            <p class="vt-estimator-results-link vt-post-link">',
        '              <a href="https://www.veritread.com/postaload/makeandmodel.aspx?Mode=QP" class="vt-button" target="_blank">Get Shipping Bids</a>',
        '            </p>',
        '          </div>',
        '        ',
        '          <div class="{{col1Class}}" style="display:none;">',
        '',
        '            <div class="vt-specs">',
        '              <div class="vt-cta"><span class="vt-cta-num">1</span> Review Shipping Dimensions</div>',
        '',
        '              <div class="vt-schematic-and-dimensions">',
        '                <table class="vt-schematic-table vt-item-details">',
        '                  <tbody>',
        '                    <tr>',
        '                      <td class="vt-schematic-cell">',
        '                        <div class="vt-schematic"></div>',
        '                        <div class="vt-dimensions-keys">',
        '                          <span class="vt-dimensions-key vt-dimensions-key-local"><i class="vt-key-local" style="background-image: url(\'{{assetsDir}}/img/vt-dimensions.png\');"></i>{{localDimensionsLabel}}</span>',
        '                          <span class="vt-dimensions-key vt-dimensions-key-vt"><i class="vt-key-vt" style="background-image: url(\'{{assetsDir}}/img/vt-dimensions.png\');"></i>Base Model at time of manufacturing</span>',
        '                        </div>',
        '                        <div class="vt-default-disclaimer" style="display:none;">',
        '                          These dimensions are taken from the base model. If your equipment has been modified, please update the dimensions.',
        '                        </div>',
        '                      </td>',
        '                      <td class="vt-dimensions-cell">',
        '                        <section class="vt-dimensions vt-item-details" style="display:none;">',
        '                          <div class="vt-dimensions-inner">',
        '                            <div class="vt-label vt-dim-length">',
        '                              <span>Length</span> <i class="vt-dim-key" style="background-image: url(\'{{assetsDir}}/img/vt-dimensions.png\');"></i>',
        '                            </div>',
        '                            <div class="vt-type">',
        '                              <input type="text" id="{{elementName}}-item-length-feet" class="vt-specs-field" data-type="english" data-dimension="length" data-related-meters="#{{elementName}}-item-length-meters" data-related-measure="#{{elementName}}-item-length-inches" value=""> <span>ft</span>',
        '                              <input type="text" id="{{elementName}}-item-length-inches" class="vt-specs-field" data-type="english" data-dimension="length"  data-related-meters="#{{elementName}}-item-length-meters" data-related-measure="#{{elementName}}-item-length-feet" value=""> <span>in</span>',
        '                              <input type="text" id="{{elementName}}-item-length-meters" class="vt-specs-field vt-metric vt-hide" data-type="metric" data-dimension="length" data-related-feet="#{{elementName}}-item-length-feet" data-related-inches="#{{elementName}}-item-length-inches" value=""> <span class="vt-hide">m</span>',
        '                            </div>',
        '',
        '                            <div class="vt-label vt-dim-width">',
        '                              <span>Width</span> <i class="vt-dim-key" style="background-image: url(\'{{assetsDir}}/img/vt-dimensions.png\');"></i>',
        '                            </div>',
        '                            <div class="vt-type">',
        '                              <input type="text" id="{{elementName}}-item-width-feet" class="vt-specs-field" data-type="english" data-dimension="width" data-related-meters="#{{elementName}}-item-width-meters" data-related-measure="#{{elementName}}-item-width-inches" value=""> <span>ft</span>',
        '                              <input type="text" id="{{elementName}}-item-width-inches" class="vt-specs-field" data-type="english"  data-dimension="width" data-related-meters="#{{elementName}}-item-width-meters" data-related-measure="#{{elementName}}-item-width-feet" value=""> <span>in</span>',
        '                              <input type="text" id="{{elementName}}-item-width-meters" class="vt-specs-field vt-metric vt-hide" data-type="metric"  data-dimension="width" data-related-feet="#{{elementName}}-item-width-feet" data-related-inches="#{{elementName}}-item-width-inches" value=""> <span class="vt-hide">m</span>',
        '                            </div>',
        '',
        '                            <div class="vt-label vt-dim-height">',
        '                              <span>Height</span> <i class="vt-dim-key" style="background-image: url(\'{{assetsDir}}/img/vt-dimensions.png\');"></i>',
        '                            </div>',
        '                            <div class="vt-type">',
        '                              <input type="text" id="{{elementName}}-item-height-feet" class="vt-specs-field" data-type="english"  data-dimension="height" data-related-meters="#{{elementName}}-item-height-meters" data-related-measure="#{{elementName}}-item-height-inches" value=""> <span>ft</span>',
        '                              <input type="text" id="{{elementName}}-item-height-inches" class="vt-specs-field" data-type="english"  data-dimension="height" data-related-meters="#{{elementName}}-item-height-meters" data-related-measure="#{{elementName}}-item-height-feet" value=""> <span>in</span>',
        '                              <input type="text" id="{{elementName}}-item-height-meters" class="vt-specs-field vt-metric vt-hide" data-type="metric" data-dimension="height" data-related-feet="#{{elementName}}-item-height-feet" data-related-inches="#{{elementName}}-item-height-inches" value=""> <span class="vt-hide">m</span>',
        '                            </div>',
        '',
        '                            <div class="vt-label vt-dim-attwidth">',
        '                              <span>Attachment Width</span> <i class="vt-dim-key" style="background-image: url(\'{{assetsDir}}/img/vt-dimensions.png\');"></i>',
        '                            </div>',
        '                            <div class="vt-type vt-dim-attwidth">',
        '                              <input type="text" id="{{elementName}}-item-attwidth-feet" class="vt-specs-field" data-type="english"  data-dimension="attWidth" data-related-meters="#{{elementName}}-item-attwidth-meters" data-related-measure="#{{elementName}}-item-attwidth-inches" value=""> <span>ft</span>',
        '                              <input type="text" id="{{elementName}}-item-attwidth-inches" class="vt-specs-field" data-type="english" data-dimension="attWidth" data-related-meters="#{{elementName}}-item-attwidth-meters" data-related-measure="#{{elementName}}-item-attwidth-feet" value=""> <span>in</span>',
        '                              <input type="text" id="{{elementName}}-item-attwidth-meters" class="vt-specs-field vt-metric vt-hide" data-type="metric" data-dimension="attWidth" data-related-feet="#{{elementName}}-item-attwidth-feet" data-related-inches="#{{elementName}}-item-attwidth-inches" value=""> <span class="vt-hide">m</span>',
        '                            </div>',
        '',
        '                            <div class="vt-label vt-dim-angattwidth">',
        '                              <span>Angled Att. Width</span> <i class="vt-dim-key" style="background-image: url(\'{{assetsDir}}/img/vt-dimensions.png\');"></i>',
        '                            </div>',
        '                            <div class="vt-type vt-dim-angattwidth">',
        '                              <input type="text" id="{{elementName}}-item-angattwidth-feet" class="vt-specs-field" data-type="english" data-dimension="angAttWidth" data-related-meters="#{{elementName}}-item-angattwidth-meters" data-related-measure="#{{elementName}}-item-angattwidth-inches" value=""> <span>ft</span>',
        '                              <input type="text" id="{{elementName}}-item-angattwidth-inches" class="vt-specs-field" data-type="english" data-dimension="angAttWidth" data-related-meters="#{{elementName}}-item-angattwidth-meters" data-related-measure="#{{elementName}}-item-angattwidth-feet" value=""> <span>in</span>',
        '                              <input type="text" id="{{elementName}}-item-angattwidth-meters" class="vt-specs-field vt-metric vt-hide" data-type="metric" data-dimension="angAttWidth" data-related-feet="#{{elementName}}-item-angattwidth-feet" data-related-inches="#{{elementName}}-item-angattwidth-inches" value=""> <span class="vt-hide">m</span>',
        '                            </div>',
        '',
        '                            <div class="vt-label vt-dim-weight">',
        '                              <span>Weight</span> <i class="vt-dim-key" style="background-image: url(\'{{assetsDir}}/img/vt-dimensions.png\');"></i>',
        '                            </div>',
        '                            <div class="vt-type">',
        '                              <input type="text" id="{{elementName}}-item-weight" class="vt-specs-field vt-weight-field" data-type="english" data-dimension="weight" data-related-kg="#{{elementName}}-item-weight-kg" value=""> <span>lbs</span>',
        '                              <input type="text" id="{{elementName}}-item-weight-kg" class="vt-specs-field vt-weight-field vt-hide" data-type="metric" data-dimension="weight" data-related-lb="#{{elementName}}-item-weight" value=""> <span class="vt-hide">kg</span>',
        '                            </div>',
        '                          </div>',
        '                        </section>',
        '',
        '                        <section class="vt-unit-converter vt-item-details" style="display:none;">',
        '                          <label class="vt-units" for="{{elementName}}-units-english">',
        '                            <input type="radio" id="{{elementName}}-units-english" class="vt-units-english" data-type-value="english" name="{{elementName}}-units" /> English (ft/in/lbs)',
        '                          </label>',
        '                          <label class="vt-units" for="{{elementName}}-units-metric">',
        '                            <input type="radio" id="{{elementName}}-units-metric" class="vt-units-english" data-type-value="metric" name="{{elementName}}-units" /> Metric (m/kg)',
        '                          </label>',
        '                        </section>',
        '                      </td>',
        '                    </tr>',
        '                  </tbody>',
        '                </table>',
        '',
        '              </div><!--/.vt-dimensions-->',
        '',
        '            </div><!--/.vt-schematic-and-dimensions-->',
        '',
        '        <div class="vt-locations vt-item-details" style="display:none;">',
        '        <div class="vt-cta"><span class="vt-cta-num">2</span> Pickup Location <span class="vt-separator">&amp;</span> Delivery Location:</div>',
        '        <div class="vt-location-ui">',
        '          <div class="vt-pickup-location-ui">',
        '              <div class="vt-estimate-parameters">',
        '                  <div class="vt-location-header vt-mobile-show">Pickup Location</div>',
        '                <input type="text" class="vt-pickup-location" name="postalcode" placeholder="Pickup City, State or ZIP">',
        '                <select id="vt-pickup-country" class="vt-pickup-country" name="pucountry" placeholder="Country" tabindex="-1">',
        '                  <option value="US">United States</option>',
        '                  <option value="CA">Canada</option>',
        '                  <option value="MX">Mexico</option>',
        '                  <option value="FR">Other</option>',
        '                </select>',
        '              </div>',
        '            </div>',
        '            <div class="vt-delivery-location-ui">',
        '              <div class="vt-estimate-parameters">',
        '                  <div class="vt-location-header vt-mobile-show">Delivery Location</div>',
        '                <input type="text" class="vt-delivery-location" name="postalcode" placeholder="Delivery City, State or ZIP">',
        '                <select id="vt-delivery-country" class="vt-delivery-country" name="country" placeholder="Country" tabindex="-1">',
        '                  <option value="US">United States</option>',
        '                  <option value="CA">Canada</option>',
        '                  <option value="MX">Mexico</option>',
        '                  <option value="FR">Other</option>',
        '                </select>',
        '              </div>',
      // + vtEstimateButtonTwoCol
        '            </div>',
        '{{estimateButton}}',
        '        </div><!--/.panel.well-->',
        '        </div><!--/.vt-locations-->',
        '              <div class="vt-estimate-slider" style="display:none;">',
        '                  <div class="vt-cta" id="vt-estimate-slider-container"><span class="vt-cta-num">3</span> Set Priority</div>',
        '          <div class="vt-panel vt-estimator">',
        '            <div class="vt-estimator-results" style="display:none;">',
        '              <div class="vt-goodtobad">',
        '',
        '                <div class="vt-gradfull vt-grad"></div>',
        '                <!--[if lt IE 9]>',
        '                <div class="vt-grad1 vt-grad"></div>',
        '                <div class="vt-grad2 vt-grad"></div>',
        '                <![endif]-->',
        '                <div class="vt-high"><h5>Expedited</h5></div>',
        '                <div class="vt-average-pointer" id="vt-average-pointer" style="background: url(\'{{assetsDir}}/img/estimator-pointer-vert.png\') no-repeat;"></div>',
        '                <div class="vt-average-pointer-mobile"></div>',
        '                <div class="vt-low"><h5>Low Priority</h5></div>',
        '',
        '                <h5 class="vt-subheader vt-scale vt-pointer-highest">$----</h5>',
        '                <h5 class="vt-subheader vt-scale vt-pointer-higher">$----</h5>',
        '                <h5 class="vt-subheader vt-scale vt-pointer-lower">$----</h5>',
        '                <h5 class="vt-subheader vt-scale vt-pointer-lowest">$----</h5>',
        '',
        '              </div><!-- /.good-to-bad -->',
        '            </div><!--/.estimator-results-->',
        '          </div><!-- /.panel.estimator-->',
        '',
        '              </div><!--/.vt-estimate-slider-->',
        '{{noEstimate}}',
        '{{loadAdvisor}}',
        '          </div><!--/.specs-and-inputs-->',
        '',
        '{{results}}',
        '',
        '{{col2}}',
        '',
        '        </div><!--.vtestimator-->',
        '{{footer}}',
        '      </div>',
        '  </form>'
    ];

    return app;
}());
