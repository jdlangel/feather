﻿(function ($) {
    angular.module('sfSelectors')
        .directive('sfSelectedItemsView', ['serverContext', function (serverContext) {
            return {
                restrict: "E",
                scope: {
                    items: '=?',
                    selectedItems: '=?',
                    identifierField: '=?',
                    searchIdentifierField: '=?',
                    sortable: '@'
                },
                templateUrl: function (elem, attrs) {
                    var assembly = attrs.templateAssembly || 'Telerik.Sitefinity.Frontend';
                    var url = attrs.templateUrl || 'Selectors/sf-selected-items-view.html';
                    return serverContext.getEmbeddedResourceUrl(assembly, url);
                },
                link: {
                    post: function (scope, element, attrs) {
                        var defaultIdentifierField = 'Title';
                        var identifierField = scope.identifierField || defaultIdentifierField;
                        var originalItems = [];

                        scope.$watch('items.length', function () {
                            // the collection is not changed by the search
                            if (!scope.filter.searchString || scope.filter.searchString === "") {
                                originalItems = [];
                                Array.prototype.push.apply(originalItems, scope.items);
                            }
                        });

                        scope.isListEmpty = function () {
                            return originalItems.length === 0;
                        };

                        scope.bindIdentifierField = function (item) {
                            return bindSearchIdentifierField(item, identifierField);
                        };

                        var bindSearchIdentifierField = function (item, filterIdentifierField) {
                            if (item) {
                                var mainField = item[filterIdentifierField];

                                var valueProp = 'Value';

                                if (!mainField) {
                                    return item.Id;
                                }

                                if (typeof mainField === 'string') {
                                    return mainField;
                                }
                                else if (valueProp in mainField) {
                                    return mainField.Value;
                                }
                            }
                        };

                        scope.sortItems = function (e) {
                            var element = scope.selectedItems[e.oldIndex];
                            scope.selectedItems.splice(e.oldIndex, 1);
                            originalItems.splice(e.oldIndex, 1);
                            scope.selectedItems.splice(e.newIndex, 0, element);
                            originalItems.splice(e.newIndex, 0, element);
                        };

                        scope.itemClicked = function (item) {
                            var selectedItemIndex;
                            for (var i = 0; i < scope.selectedItems.length; i++) {
                                if (scope.selectedItems[i].item.Id === item.Id) {
                                    selectedItemIndex = i;
                                    break;
                                }
                            }

                            scope.selectedItems[selectedItemIndex].isChecked = !scope.selectedItems[selectedItemIndex].isChecked;
                        };

                        scope.filter = {
                            placeholder: 'Narrow by typing',
                            timeoutMs: 500,
                            search: function (keyword) {
                                scope.items.length = 0;

                                if (!keyword) {
                                    Array.prototype.push.apply(scope.items, originalItems);
                                }
                                else {
                                    for (var i = 0; i < originalItems.length; i++) {
                                        if (scope.searchIdentifierField) {
                                            if (bindSearchIdentifierField(originalItems[i].item, scope.searchIdentifierField).toLowerCase().indexOf(keyword.toLowerCase()) !== -1) {
                                                scope.items.push(originalItems[i]);
                                            }
                                        }
                                        else if (scope.bindIdentifierField(originalItems[i].item).toLowerCase().indexOf(keyword.toLowerCase()) !== -1) {
                                            scope.items.push(originalItems[i]);
                                        }
                                    }
                                }
                            }
                        };

                        scope.sortableOptions = {
                            hint: function (element) {
                                return $('<div class="list-group-item list-group-item-multiselect list-group-item-draggable list-group-item-hint">' +
                                            element.html() +
                                        '</div>');
                            },
                            placeholder: function (element) {
                                return $('<div class="list-group-item list-group-item-placeholder"></div>');
                            },
                            handler: ".handler",
                            axis: "y"
                        };
                    }
                }
            };
        }]);
})(jQuery);