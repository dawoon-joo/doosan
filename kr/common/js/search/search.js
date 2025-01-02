var Search = (function () {

	$(document).ready(init);

	var config = {
		allTabNewsCount: 2,
		allTabWebCount: 2,
		newsTabPageSize: 10,
		webTabPageSize: 10,
		relatedKeywordCount: 5,
		paginationSize: 10,
		autoCompleteKeywordCount: 10,
	};

	var language = '';
	var query = '';
	var exQuery = null;
	var searchCompany = '';
	var currentPage = 0;
	var currentType = null;
	var sortBy = 'date';
	var sortOrder = 'desc';

	var resultNewsCount = 0;
	var resultWebCount = 0;

	var restUrl = {
		search: 'http://192.168.0.41:8080/rest/search',
		searchSubsidiary: 'https://www.doosan.com/rest/search/subsidiary',
	};

	var event = {
		id01: 'doosan_0001',
		id02: 'doosan_0002',
		id03: 'doosan_0003',
		id04: 'doosan_0004',
		id05: 'doosan_0005'
	}

	var elementId = {
		searchQuery: 'searchQuery',
		searchButton: 'btn_search',
		subsidiaryList: 'subsidiaryList',
		allListDiv: 'allListDiv',
		allNewsListDiv: 'result_news',
		allNewsList: 'allNewsList',
		allWebListDiv: 'result_web',
		allWebList: 'allWebList',
		newsOnlyListDiv: 'newsOnlyListDiv',
		newsOnlyList: 'newsOnlyList',
		webOnlyListDiv: 'webOnlyListDiv',
		webOnlyList: 'webOnlyList',
		detailResultList: 'detail_list_inner',
		resultDiv: 'result_div',
		noAllResult: 'no_all_result',
		showAllButton: 'showAllButton',
		showNewsButton: 'showNewsButton',
		showWebButton: 'showWebButton',
		companySelectBox: 'companySelectBox',
		pagination: 'pagination',
		subsidiaryArea: 'subsidiaryArea',
		swiperContainer: 'swiper-container',
		subsidiaryPaging: 'subsidiaryPaging',
		subsidiaryList: 'subsidiaryList',
		sortDateDesc:'sort_date_desc',
		sortDateAsc:'sort_date_asc',
		async: 'async',
	};

	var jqueryObject = {
		searchQuery: null,
		searchButton: null,
		subsidiaryList: null,
		allNewsListDiv: null,
		allNewsList: null,
		allWebListDiv: null,
		allWebList: null,
		newsOnlyListDiv: null,
		newsOnlyList: null,
		webOnlyListDiv: null,
		webOnlyList: null,
		resultList: null,
		resultDiv: null,
		noAllResult: null,
		showAllButton: null,
		showNewsButton: null,
		showWebButton: null,
		companySelectBox: null,
		pagination: null,
		subsidiaryArea: null,
		swiperContainer: null,
		subsidiaryPaging: null,
		subsidiaryList: null,
		async: null,
	};

	var subsidiarySlider;

	function init() {
		initParameters(); //lang setting
		initJqueryObject(); //element Id setting
		initQuery(); //get params setting
		initAllResults();
		initSelectBox();
		initEvents();

		function initParameters() {
			language = getLanguageFromUrl();

			function getLanguageFromUrl() {
				var url = window.location.href;
				url = url.replace(/([a-zA-Z0-9]+):\/\//g, '');

				var results = url.split('/');
				if(results[1]) {
					if(checkAvailableLanguage(results[1])) {
						var lang = results[1];
					}
				}

				return lang;

				function checkAvailableLanguage(lang) {
					switch(lang) {
						case 'kr':
						case 'en':
						case 'cn':
							return true;
						default:
							return false;
					}
				}
			}
		}

		function initJqueryObject() {
			for(var key in elementId) {
				jqueryObject[key] = $('#' + elementId[key]);
			}
		}

		function initQuery() {
			query = jqueryObject.searchQuery.val();
			applyCurrentQueryOnHtml();
		}

		function initAllResults() {
			callRestAutoCorrects(getAndPrintFirstPage);
		}

		function initSelectBox() {
			$('.selc-name').find('a').click(companyClickEventHandler);
			$('.selc-box').find('a').click(companyBoxClickEventHandler);
			function companyClickEventHandler(e) {
				e.preventDefault();
            	$(this).parents(".search-select").find('.selc-box').stop().slideToggle();
			}
			function companyBoxClickEventHandler(e) {
				e.preventDefault();
            	var selcBoxTxt = $(this).text();
            	$(this).parents(".selc-box").stop().slideUp();
            	$(this).parents(".search-select").find('.selc-name a').text(selcBoxTxt);
				Search.setSearchCompany($(this).data('code'));
				Search.getOriginResult(query);
			}
		}

		function initEvents() {
			jqueryObject.showAllButton.click(showAllTab);
			jqueryObject.showNewsButton.click(showNewsTab);
			jqueryObject.showWebButton.click(showWebTab);

			jqueryObject.searchQuery.on('keydown focusin', function(event) {
				if(event.keyCode === 13) {
					event.preventDefault();
					changeSearchQueryAndPrintFirstPage();
				} else {
					callRestResultAutoComplete(getAndShowAutoComplete);
				}
			}).on('focusout', function(event) {
				setTimeout(function(){
					$('.auto-keyword').hide();
				},150);
			});

			jqueryObject.searchButton.click(function() {
				changeSearchQueryAndPrintFirstPage();
			});

			attachShowAllResultLinkEvent();

			function attachShowAllResultLinkEvent() {
				$('.btn-opentab-news').click(showNewsTab);
				$('.btn-opentab-web').click(showWebTab);
			}
		}
	}

	function applyCurrentQueryOnHtml() {
		jqueryObject.searchQuery.val(query);
		$('span.searchQuery').text(query);
	}

	function getAndPrintDetailedPages() {
		if(currentType === null || currentType === 'news') {
			callRestResultSearch(currentType, searchCompany, currentPage, config.newsTabPageSize, getShowRestResultFunction(null, jqueryObject.newsOnlyList, currentType));
		}
		if(currentType === null || currentType === 'web') {
			callRestResultSearch(currentType, searchCompany, currentPage, config.webTabPageSize, getShowRestResultFunction(null, jqueryObject.webOnlyList, currentType));
		}
	}

	function getAndPrintFirstPage(res) {
		exQuery = query;

		if(res != null && res.hits != null && res.hits.hits instanceof Array && res.hits.hits.length > 0) {
			exQuery = res.hits.hits[0]._source.keyword;
		}

		applyCurrentQueryOnHtml();

		currentPage = 0;

		if(query != null && query.length > 0) {
			//getAndShowSubsidary();
			async.parallel([
				function (callback) {
					callRestResultCountSearch('news', searchCompany, 0, config.allTabNewsCount, getShowRestResultFunction(callback, jqueryObject.allNewsList, 'news', jqueryObject.allNewsListDiv));
				},
				function (callback) {
					callRestResultCountSearch('web', searchCompany, 0, config.allTabNewsCount, getShowRestResultFunction(callback, jqueryObject.allWebList, 'web', jqueryObject.allWebListDiv));
				},
			], function(error, result) {
				if((result instanceof Array) && result.length >= 2) {
					var allResultCount = result[0] + result[1];
					//console.log('exQuery ::: ' + exQuery + ', query ::: ' + query);

					applyCurrentQueryOnHtml();

					$('input.allResultCount').val(allResultCount);
					$('span.allResultCount').text(allResultCount);

					setCustomerKeywords();
					showAllTab();
					if(allResultCount > 0) {
						getAndShowRelatedKeywords();
						if(query === exQuery) {
							$('.auto-correct-display').html('');
						}
					} else {
						if(query != exQuery) {
							$('.auto-correct-display').html('');
							$('.chain').html('');
							$('span.exQuery > a').text(exQuery);
							$('#result_div .auto-correct-desc').clone().appendTo('.auto-correct-display');
						}
					}

					jqueryObject.searchQuery.blur();
				}
			});
		} else {
			jqueryObject.searchQuery.focus();
		}
	}

	function setCustomerKeywords() {
		callRestSearch(event.id05, restUrl.search, null, null, null, null, function(res){
			//console.log(res);
		});
	}

	function getAndShowRelatedKeywords() {
		callRestSearch(event.id04, restUrl.search, null, searchCompany, null, null, function(res) {
			var data = res.aggregations.related_terms.buckets;

			if(!(data instanceof Array)) {
				return;
			}

			if(data.length <= 0) {

				var innerHtml = '';
				if ($('#searchQuery').val()=='두산뉴스룸'){
					innerHtml = '<a href="javascript:;" class="related-search">보도자료</a><a href="javascript:;" class="related-search">뉴스</a>';
					$('.chain').html(innerHtml);
					$('.chain .related-search').click(relatedKeywordClickEventHandler);
					function relatedKeywordClickEventHandler() {
						Search.getOriginResult($(this).text());
					}
				}else{
					$('.chain').html('<a href=\"javascript:;\">'+ springMessages.noRelateKeyword +'</a>');
				}
				return;
			}

			var innerHtml = '';
			for (var i=0; i<config.relatedKeywordCount; i++) {
				if(data[i] == null) {
					break;
				}
				innerHtml = innerHtml + '<a href=\"javascript:;\" class=\"related-search\">'+ data[i].key +'</a>';
			}

			$('.chain').html(innerHtml);
			$('.chain .related-search').click(relatedKeywordClickEventHandler);

			function relatedKeywordClickEventHandler() {
				Search.getOriginResult($(this).text());
			}
		});
	}

	function callRestResultSearch(type, company, page, pageSize, successCallback) {
		callRestSearch(event.id01, restUrl.search, type, company, page, pageSize, successCallback);
	}

	function callRestResultCountSearch(type, company, page, pageSize, successCallback) {
		callRestSearch(event.id01, restUrl.search, type, company, page, pageSize, successCallback);
	}

	function callRestResultAutoComplete(successCallback) {
		callRestSearch(event.id02, restUrl.search, null, null, null, null, successCallback);
	}

	function callRestAutoCorrects(successCallback) {
		callRestSearch(event.id03, restUrl.search, null, null, null, null, successCallback);
	}

	function callRestSearch(id, url, type, company, page, pageSize, successCallback, failCallback) {
		var ajaxParam = {
			query: query,
			language: language,
			sortBy: sortBy,
			sortOrder: sortOrder
		};

		if(id != null) {
			ajaxParam.id = id;
		}
		if(type != null) {
			ajaxParam.type = type;
		}
		if(id == event.id01 && company != null && company.length > 0) {
			ajaxParam.pCompany = company;
		}
		if(page != null) {
			ajaxParam.page = page*10;
		}
		if(pageSize != null) {
			ajaxParam.pageSize = pageSize;
		}

		$.ajax({
			url: url,
			method: 'get',
			dataType : 'jsonp',
			data: ajaxParam,
			success: successCallback,
			error: failCallback
		});
	}

	function getShowRestResultFunction(callback, jqueryTarget, type, displayingTarget, noResultDiv) {

		return showRestResultOnTarget;

		function showRestResultOnTarget(data) {
			if(type === 'news' && callback !== null) {
				Search.setResultNewsCount(0);
				var parsedCount = parseInt(data.hits.total.value);
				if(parsedCount > 0) {
					Search.setResultNewsCount(parsedCount);
					$('input.newsResultCount').val(parsedCount);
					$('span.newsResultCount').text(parsedCount);
				} else {
					$('input.newsResultCount').val(0);
					$('span.newsResultCount').text('0');
				}

				callback(null, Search.getResultNewsCount());
			}

			if(type === 'web' && callback !== null) {
				Search.setResultWebCount(0);
				var parsedCount = parseInt(data.hits.total.value);
				if(parsedCount > 0) {
					Search.setResultWebCount(parsedCount);
					$('input.webResultCount').val(parsedCount);
					$('span.webResultCount').text(parsedCount);
				} else {
					$('input.webResultCount').val(0);
					$('span.webResultCount').text('0');
				}
				callback(null, Search.getResultWebCount());
			}

			var result = data.hits.hits;
			if(!(result instanceof Array) || jqueryTarget == null) {
				return;
			}

			var innerHtml = '';
			if(result.length === 0) {
				$('.btn-opentab-'+type).hide();
				$('.auto-correct-desc').show();
				innerHtml += '<div class=\"list\" style=\"font-size: 2.4rem;text-align: center;\">' + springMessages.noResultKeyword + '</div>';

			} else {
				$('.btn-opentab-'+type).show();
				$('.auto-correct-desc').hide();
				for(var i=0; i<result.length; i++) {
					innerHtml += '<div class=\"list\">';
                            innerHtml += '<h4 class=\"tit\">';
                            innerHtml += '<a href=\"'+ getUrlFromResultItem(result[i]._source) +'\" target=\"_blank\" title=\"Open new window\">';
                            innerHtml += getTitleFromResultItem(result[i]).replaceAll('<b>', '<b><strong>').replaceAll('</b>', '</strong></b>');
                            innerHtml += '</a></h4>';
                            innerHtml += '<p class=\"txt\">' + getContentFromResultItem(result[i]) + '</p>';
                            innerHtml += '<div class=\"date\">';
							if(type === 'news') {
								var pressDate = getPressDateFromResultItem(result[i]._source);
								if(pressDate != null) {
									innerHtml = innerHtml + '<span>' + dateToDotNotationString(pressDate) + '</span>'
								}
							}
                            innerHtml += '<span>'+ getCompanyNameFromResultItem(result[i]._source) +'</span>';
                            innerHtml += '</div>';
                            innerHtml += '</div>';
				}
			}

			jqueryTarget.html(innerHtml);

			if(result.length > 0 && displayingTarget != null) {
				displayingTarget.addClass('open').show();
			}
			printPagination();
		}
	}

	function changeSearchQueryAndPrintFirstPage(newQuery) {
		$('.auto-keyword').hide();
		if(newQuery != null && newQuery.length > 0) {
			query = newQuery;
			jqueryObject.searchQuery.val(newQuery);
		} else {
			query = jqueryObject.searchQuery.val();
		}
		callRestAutoCorrects(getAndPrintFirstPage);
	}

	function getCompanyNameFromResultItem(resultItem) {
		if(resultItem == null) {
			return '';
		} else if(resultItem.affiliates != null) {
			return resultItem.affiliates;
		} else {
			return '';
		}
	}

	function getUrlFromResultItem(resultItem) {
		if(resultItem == null) {
			return "#";
		} else if(resultItem.url != null) {
			return resultItem.url;
		} else if(resultItem.domains != null) {
			return resultItem.domains;
		} else {
			return "#";
		}
	}

	function getPressDateFromResultItem(resultItem) {
		var pressDate = resultItem.date
		return new Date(pressDate);
	}

	function getContentFromResultItem(resultItem) {
		if(resultItem == null || resultItem._source == null) {
			return '';
		} else if(resultItem.highlight != null && resultItem.highlight['content.ng'] != null) {
			return resultItem.highlight['content.ng'][0];
		} else if(resultItem.highlight != null && resultItem.highlight.content != null) {
			return resultItem.highlight.content[0];
		} else if(resultItem._source != null) {
			return resultItem._source.content;
		} else {
			return getUrlFromResultItem(resultItem);
		}
	}

	function getTitleFromResultItem(resultItem) {
		if(resultItem == null || resultItem._source == null) {
			return '';
		} else if(resultItem.highlight != null && resultItem.highlight['title.ng'] != null) {
			return resultItem.highlight['title.ng'][0];
		} else if(resultItem.highlight != null && resultItem.highlight.title != null) {
			return resultItem.highlight.title[0];
		} else if(resultItem._source.title != null) {
			return resultItem._source.title;
		} else {
			return getUrlFromResultItem(resultItem);
		}
	}

	function dateToDotNotationString(date) {
		if(date == null || isNaN(date.getTime())) {
			return '';
		}

		var year = date.getFullYear();
		var month = date.getMonth() + 1;
		var dayOfMonth = date.getDate();

		var monthString = (month < 10) ? '0'+month : month;
		var dayOfMonthString = (dayOfMonth < 10) ? '0'+dayOfMonth : dayOfMonth;

		return `${year}.${monthString}.${dayOfMonthString}`;
	}

	function showAllTab() {
		currentType = null;
		currentPage = 0;

		$('.search_nav a').removeClass('active');
		jqueryObject.showAllButton.addClass('active');

		jqueryObject.newsOnlyListDiv.removeClass('open').hide();
		jqueryObject.webOnlyListDiv.removeClass('open').hide();
		jqueryObject.allListDiv.addClass('open').show();
	}

	function showNewsTab() {
		currentType = 'news';
		currentPage = 0;

		$('.search_nav a').removeClass('active');
		jqueryObject.showNewsButton.addClass('active');

		jqueryObject.webOnlyListDiv.removeClass('open').hide();
		jqueryObject.allListDiv.removeClass('open').hide();
		jqueryObject.newsOnlyListDiv.addClass('open').show();
		getAndPrintDetailedPages();
		printPagination();
	}

	function showWebTab() {
		currentType = 'web';
		currentPage = 0;

		$('.search_nav a').removeClass('active');
		jqueryObject.showWebButton.addClass('active');

        jqueryObject.newsOnlyListDiv.removeClass('open').hide();
		jqueryObject.allListDiv.removeClass('open').hide();
		jqueryObject.webOnlyListDiv.addClass('open').show();
		getAndPrintDetailedPages();
		printPagination();
	}

	function printPagination() {
		var totalPages = 0;
		if(currentType === 'news') {
			if((resultNewsCount % config.newsTabPageSize) != 0) {
				totalPages = Math.ceil(resultNewsCount / config.newsTabPageSize);
			} else {
				totalPages = (resultNewsCount / config.newsTabPageSize);
			}
		} else if(currentType === 'web') {
			if((resultWebCount % config.webTabPageSize) != 0) {
				totalPages = Math.ceil(resultWebCount / config.webTabPageSize);
			} else {
				totalPages = (resultWebCount / config.webTabPageSize);
			}
		}

		if(totalPages <= 0) {
			$('.pg_wrap.pg_wrap_' + currentType).html('');
			return;
		}

		var innerHtml = '';
		var startPageNumber = Math.floor(currentPage / config.paginationSize) * config.paginationSize;
		var hasNextPagination = (totalPages - 1) > (startPageNumber + config.paginationSize);

		if(startPageNumber !== 0) innerHtml += '<a class=\"'+ type +'-pg-btn pg_btn pg_start\" data-page=\"0\"><span class=\"hide\">시작페이지로 이동</span></a>';
		if((startPageNumber - 10) > 1) innerHtml += '<a class=\"'+ currentType +'-pg-btn pg_btn pg_prev\"  data-page=\"'+ (startPageNumber - 1) +'\"><span class=\"hide\">이전페이지로 이동</span></a>';

		innerHtml += '<span class=\"pg\">';

		for(var i=0; i<config.paginationSize; i++) {
			var printingPage = startPageNumber + i;
			if(printingPage >= totalPages) {
				break;
			}
			innerHtml += '<a class=\"'+ currentType +'-pg-btn';

			if(printingPage === currentPage) {
				innerHtml += ' on';
			}
			innerHtml += '\" data-page=\"'+ printingPage +'\">' + (printingPage+1) + '<span class=\"hide\">페이지</span></a>';
		}
		innerHtml += '</span>';

		if(hasNextPagination) innerHtml += '<a class=\"pg-btn pg-next '+ currentType +'-pg-btn\" data-page=\"'+ (startPageNumber + 10) +'\"><span class="hide">다음페이지로 이동</span></a>';
		if((currentPage + 1) != totalPages ) innerHtml += '<a class=\"pg-btn pg-end '+ currentType +'-pg-btn\" data-page=\"'+ (totalPages - 1) +'\"><span class=\"hide\">마지막페이지로 이동</span></a>';

		$('.pagination.pg_wrap_' + currentType).html(innerHtml);

		$('.pagination.pg_wrap_' + currentType).find('a').click(function() {
			var clickedPage = parseInt($(this).data('page'));
			if(isNaN(clickedPage)) {
				return;
			}

			Search.setCurrentPage(clickedPage);
			$('html,body').animate({ scrollTop: 0 }, 100);
			getAndPrintDetailedPages();
		});
	}

	function getOriginResult(text) {
		changeSearchQueryAndPrintFirstPage(text);
	}

	function getResultNewsCount() {
		return resultNewsCount;
	}
	function setResultNewsCount(count) {
		resultNewsCount = count;
	}

	function getResultWebCount() {
		return resultWebCount;
	}
	function setResultWebCount(count) {
		resultWebCount = count;
	}

	function getSearchCompany() {
		return searchCompany;
	}
	function setSearchCompany(companyName) {
		searchCompany = companyName;
	}

	function getCurrentPage() {
		return currentPage;
	}
	function setCurrentPage(pageNum) {
		currentPage = pageNum;
	}

	function setSortBy(param) {
		sortBy = param;
		Search.getOriginResult(query);
	}

	function setSortOrder(param) {
		sortOrder = param;
		Search.getOriginResult(query);

		if(param =="desc"){
			$('#search_results .sort_area .sort_desc').addClass('active');
			$('#search_results .sort_area .sort_asc').removeClass('active');
		}else{
			$('#search_results .sort_area .sort_asc').addClass('active');
			$('#search_results .sort_area .sort_desc').removeClass('active');
		}
	}

	function getAndShowAutoComplete() {

		query = jqueryObject.searchQuery.val();
		callRestSearch(event.id02, restUrl.search, null, searchCompany, null, null, function(res) {
	        var data = res.hits.hits;

	        if(!(data instanceof Array)) {
	            return;
	        }

	        if(data === null || data.length == 0){
				//$('.auto-keyword').hide();
			}else{
			}


	        var innerHtml = '';
	        for (var i=0; i<config.autoCompleteKeywordCount; i++) {
	            if(data[i] == null) {
	                break;
	            }

	            innerHtml = innerHtml + '<a href="javascript:;" class="auto-keyword-item">' + data[i].highlight['title.edge_ng'][0] + '</a>';
	        }
	        $('.auto-keyword').html(innerHtml);
	        $('.auto-keyword .auto-keyword-item').click(autoKeywordClickEventHandler);
	        $('.auto-keyword').show();

	        function autoKeywordClickEventHandler() {
	            //jqueryObject.refineSearchCheckbox.prop('checked', false);
	            changeSearchQueryAndPrintFirstPage($(this).text());
	        }
	    });

	}

	return {
		getOriginResult: getOriginResult,
		getResultNewsCount: getResultNewsCount,
		setResultNewsCount: setResultNewsCount,
		getResultWebCount: getResultWebCount,
		setResultWebCount: setResultWebCount,
		getSearchCompany: getSearchCompany,
		setSearchCompany: setSearchCompany,
		getCurrentPage: getCurrentPage,
		setCurrentPage: setCurrentPage,
		setSortBy: setSortBy,
		setSortOrder: setSortOrder,
	};

})();
