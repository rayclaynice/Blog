function redirectToAnotherPage(query) {
    const currentURL = window.location.href;
    const searchPageURL = `${window.location.origin}/search_query/`;

    // Check if the current URL is already the search page
    if (currentURL !== searchPageURL) {
        window.location.href = searchPageURL;
    }
}

// Add event listener to the search input on mouseenter
document.addEventListener('DOMContentLoaded', (event) => {
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('mouseenter', (event) => {
        const query = event.target.value;
        redirectToAnotherPage(query);
    });
});

// Handle AJAX with event delegation
$(document).ready(function() {
    $(document).on('keyup', '#search-input', function() {
        const searchQuery = $(this).val();
        $.ajax({
            url: '/search_results/', // Ensure this matches your URL pattern
            data: { q: searchQuery },
            dataType: 'json',
            success: function(data) {
            const resultBody = document.querySelector('.result-body tbody');
            resultBody.innerHTML = ''; // Clear previous results
            if (data.searches.length > 0) {
                jQuery.each(data.searches, function(index, item){
                    const row = document.createElement('tr');
                    row.innerHTML = `
                    <td>
                        <div class="widget-26-job-emp-img">
                            <img src="${item.author.profile.image.url}" alt="Company" />
                        </div>
                    </td>
                    <td>
                        <div class="widget-26-job-title">
                            <a href="#" class="search-highlight">${item.title}</a>
                            <p class="m-0"><a href="#" class="employer-name search-highlight">${item.author.username}</a></p>
                        </div>
                    </td>
                    <td>
                        <div class="widget-26-job-info">
                            <p class="type m-0 search-highlight">${item.preview}</p>
                            <p class="text-muted m-0">about <span class="location">2 days ago</span></p>
                        </div>
                    </td>
                     `;
                     resultBody.appendChild(row);
                    });
                    highlightSearchQuery(searchQuery);
                    } else {
                        const noResultRow = document.createElement('tr');
                        noResultRow.innerHTML = `
                        <td colspan="3" class="text-center">No search results found</td>
                        `;
                        resultBody.appendChild(noResultRow);
                    }
                    
                
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error("Error:", textStatus, errorThrown);
                console.log(jqXHR.responseText); // Log response text for debugging
            }
        }); 
    }); 
});

function highlightSearchQuery(searchQuery) {
    const elements = document.querySelectorAll(".search-highlight");
    if (elements.length > 0) {
        const regex = new RegExp(`(${searchQuery})`, "gi");
        elements.forEach(element => {
            element.innerHTML = element.innerHTML.replace(regex, "<span class='highlight'>$1</span>");
        });
    } else {
        console.warn("No elements found with the class 'search-highlight'.");
    }
}

// Attach the highlightSearchQuery function to DOMContentLoaded event
document.addEventListener("DOMContentLoaded", function() {
    const searchQueryElement = document.getElementById('search-input');
    if (searchQueryElement) {
        highlightSearchQuery(searchQueryElement.value);
    }
});











































/*
function redirectToAnotherPage(query) {
    const currentURL = window.location.href;
    const searchPageURL = `${window.location.origin}/search_query/`;

    // Check if the current URL is already the search page
    if (currentURL !== searchPageURL) {
        window.location.href = searchPageURL;
    }
}

document.addEventListener('DOMContentLoaded', (event) => {
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('mouseenter', (event) => {
        const query = event.target.value;
        redirectToAnotherPage(query);
    });
});




$(document).ready(function() {
    $('#search-input').keyup(function() {
      const searchQuery = $(this).val();
      $.ajax({
        url: '/search_results/', // Ensure this matches your URL pattern
        data: { q: searchQuery },
        dataType: 'json',
        success: function(data) {
          jQuery.each(data.searches, function(index, search){
            console.log("Search Result Title:", search.title);
            console.log("Search Result Title:", search.preview);
            console.log("Search Result Title:", search.content);
          });
        },
        error: function(jqXHR, textStatus, errorThrown) {
          console.error("Error:", textStatus, errorThrown);
          console.log(jqXHR.responseText); // Log response text for debugging
        }
      }); 
    }); 
  }); 
  
*/