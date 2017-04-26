import {constants} from '../constants/constants.js';
import {kinveyRequester} from '../kinvey-requester.js';
import {templateLoader as tl} from '../template-loader.js';

let carController = (function () {

    function all(context) {
        $("#carsForSale").removeClass("open");
        Promise.all([kinveyRequester.findAllCars(), tl.get("cars")])
            .then(([data, template]) => {
                //dont touch the code because "maikata si ebalo"
                let currentUser = sessionStorage.getItem("userID");
                for (let piece of data) {
                    if (currentUser === piece._acl.creator) {
                        piece.currentUser = currentUser;
                    }
                }
                context.$element().html(template(data))
            })
            .then((options) => {
                toastr.success(constants.CARS_LOADED);
            });

        $('#content').on('click', function (ev) {
            //TODO need to find a way to make width bigger cause currently it is limited to div width
            if (ev.target.nodeName === 'IMG') {
                let target = $(ev.target);
                target.animate({height: '300px', opacity: '0.8'}, "slow");
                target.animate({width: '300px', opacity: '0.8'}, "slow");
                target.animate({height: '100px', opacity: '0.8'}, "slow");
                target.animate({width: '100px', opacity: '0.8'}, "slow");
            }
            if (ev.target.nodeName === 'A') {
                let elem = $(ev.target);
                let hiddenElem = elem.next();
                $(elem).click(function () {
                    elem.hide();
                    $(hiddenElem).slideToggle('slow');
                });
            }
        })
    }

    function addCar(context) {
        $("#carsForSale").removeClass("open");
        tl.get("add-car")
            .then(template => context.$element().html(template(constants.VEHICLE_TYPES)))
            .then(() => {
                $("#btnAddCar").on("click", () => {
                    const make = $("#new-car-make").val();
                    const model = $("#new-car-model").val();
                    const price = $("#new-car-price").val();
                    const year = $("#new-car-year").val();
                    const info = $("#new-car-info").val();
                    const image = $("#new-car-image-file").val();
                    const imageUrl = "../images/" + image.split('\\')[2];
                    // const fuelType;
                    kinveyRequester.createCar(make, model, price, year, info, image)
                        .then((data) => {
                            document.location = '#/Shop';
                            toastr.success(constants.SUCCESS_ADD_VEHICLE);
                        })
                        .catch((err) => {
                            toastr.error(err.responseText);
                        });
                });
            });
    }

    function editCar(context) {
        $('.caption').on('click', function (ev) {
                let target = $(ev.target)
                let elem = ev.target.parentNode;
                let id = ($(target).attr('id'));
                if (($(elem).attr('id') === 'operationEdit') || ($(elem).attr('data-title') === ('Edit'))) {
                    Promise.all([kinveyRequester.findCarById(id), tl.get("edit-car")])
                        .then(([data, template]) => {
                            context.$element().html(template(data))
                            toastr.success(`${data.make} ${data.model} preparing for edit`);
                        })
                        .then(() => {
                            $('#btn-Back').on('click', function (ev) {
                                document.location = ('#/Shop')
                            })
                            $('#btn-Edit').on('click', function (ev) {
                                let make = $('#make-input').val();
                                let model = $('#model-input').val();
                                let price = $('#price-input').val();
                                kinveyRequester.editCar(id, make, model, price)
                                    .then(() => {
                                        toastr.success(constants.SUCCESS_EDITED)
                                        document.location = ('#/Shop');
                                    });
                            })
                        })


                }
            }
        )

    }

    function deleteCar(context) {

        $('.caption').on('click', function (ev) {
            let target = $(ev.target)
            let elem = ev.target.parentNode;
            let id = ($(target).attr('id'));
            if (($(elem).attr('id') === 'operationDelete') || ($(elem).attr('data-title') === ('Delete'))) {
                Promise.all([kinveyRequester.findCarById(id), tl.get("delete-car")])
                    .then(([data, template]) => {
                        context.$element().html(template(data))
                        toastr.success(`${data.make} ${data.model} preparing for delete`);
                    })
                    .then(() => {
                        $('#btn-goBack').on('click', function (ev) {
                            document.location = ('#/Shop')
                        })
                        $('#btn-Delete').on('click', function (ev) {
                            kinveyRequester.deleteCar(id)
                                .then(() => {
                                    toastr.success(constants.SUCCESS_DELETE)
                                    document.location = ('#/Shop');
                                });
                        })
                    })
            }
        })
    }

    return {
        all,
        addCar,
        editCar,
        deleteCar
    }

})
();

export {carController};