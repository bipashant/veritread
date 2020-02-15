$(document).ready(function(){
        $("#hero__hero__0__search-form button").text("Search Equipment");
        if($("label[for='delivery_shipping']").length){
            $("label[for='delivery_shipping']").text($("label[for='delivery_shipping']").text().replace('Shipping', 'Delivery'));
        }

        $("#hero__hero__0__search-form button").show();
        if(!($(".listing-view-admin-link").length)){
            if($(".listing-details-container").length){
                $(".listing-details-container .row").each(function () {
                    if($(this).find("b").text() == serial_label + ":" || $(this).find("b").text() == value_of_equipment_label + ":") {
                        $(this).hide();
                    }
                });
            }
        }

        function changeShippingLabel() {
            if($("#new_listing_form").length > 0){
                var shippingLabelTimer = setInterval(function(){

                    if($("label[for='listing_shipping_price']").text() == 'Shipping fee'){
                        $("label[for='listing_shipping_price']").text('Delivery Fee');
                        $("label[for='shipping-checkbox']").text('Delivery');
                        clearInterval(shippingLabelTimer);
                    }
                }, 500);



            }
        }

        changeShippingLabel();


        function displayMessageAtSearchEnd(){
            $(".home-no-listings").html(noListingFoundText);

            if($(".home-no-listings").length == 0){
                $(".home-fluid-thumbnail-grid").parent().append("<div class='home-no-listings'>"+ noListingFoundText +"</div>");
                $(".home-listings").parent().append("<div class='home-no-listings'>"+ noListingFoundText +"</div>");
            }
        }

        displayMessageAtSearchEnd();
    });
