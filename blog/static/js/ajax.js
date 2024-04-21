// javascript to display comment section on comment button click
        document.addEventListener("DOMContentLoaded", function() {
        var commentIcons = document.querySelectorAll(".toggle-comment");

        commentIcons.forEach(function(commentIcon) {
        commentIcon.addEventListener("click", function(event) {
            event.preventDefault();
            var commentSection = this.closest(".post").querySelector(".comment-section");
            if (commentSection.style.display === "none") {
            commentSection.style.display = "block";

        } 
            else {
            commentSection.style.display = "none";
        }
        });
        });
        });
        jQuery(document).ready(function() {
            // Event listener for form submission
            jQuery('#comment-form').on('submit', function(event) {
                // Prevent the default form submission behavior
                event.preventDefault();
        
                // Serialize form data
                var formData = jQuery(this).serialize();
                var $form = jQuery(this);
        
                // Submit the form using AJAX
                jQuery.ajax({
                    url: jQuery(this).attr('action'), // URL from the form's action attribute
                    method: jQuery(this).attr('method'), // HTTP method from the form's method attribute
                    data: formData, // Form data to send to the server
                    success: function(response) {
                        if (response.success) {
                            // Clear the form inputs
                            $form.find('textarea').val('');
        
                            var $commentSection = $form.closest('.post').find('.comment-section');
                            jQuery('html, body').animate({
                                scrollTop: $commentSection.offset().top
                            }, 1000); // Adjust scroll speed as needed
                        } else {
                            // Handle form errors or other failure scenarios
                            console.error('Form submission failed:', response.errors);
                        }
                    },
                    error: function(xhr, status, error) {
                        // Handle errors if needed
                        console.error('There was a problem with the AJAX request:', error);
                    }
                });
            });
        });


        jQuery(document).ready(function() {
            // Function to update the like count
            function updateLikeCount(articleId) {
                jQuery.ajax({
                    url: '/get_like_count/' + articleId + '/', // URL to fetch the updated like count
                    type: 'GET',
                    cache: false,
                    success: function(data) {
                        // Update the like count for the corresponding article
                        var likeButton = jQuery('.like-button[data-article-id="' + articleId + '"]');
                        likeButton.find('.like-count').text(data.likes_count); // Update like count
                        console.log('Number of likes:', data.likes_count);
                    },
                    error: function(xhr, textStatus, errorThrown) {
                        console.log("Error:", errorThrown);
                    }
                });
            }
        
            // Loop through each like button
            jQuery('.like-button').each(function() {
                var button = jQuery(this);
                var articleId = button.data('article-id');
        
                // Check if the article is liked and set the button color accordingly
                var isLiked = localStorage.getItem('liked_' + articleId);
                if (isLiked) {
                    button.addClass('liked');
                }
        
                // Event listener for like button clicks
                button.click(function(event) {
                    event.preventDefault(); // Prevent default click behavior
                    var articleId = button.data('article-id');
        
                    // Send AJAX request to like or unlike the article
                    jQuery.ajax({
                        url: '/like/' + articleId + '/',
                        type: 'POST',
                        beforeSend: function(xhr) {
                            xhr.setRequestHeader("X-CSRFToken", window.csrfToken);
                        },
                        success: function(data) {
                            if (data.liked) {
                                button.addClass('liked');
                                localStorage.setItem('liked_' + articleId, true);
                            } else {
                                button.removeClass('liked');
                                localStorage.removeItem('liked_' + articleId);
                            }
                            // Update the like count after the action is completed
                            updateLikeCount(articleId);
                        },
                        error: function(xhr, textStatus, errorThrown) {
                            console.log("Error:", errorThrown);
                        }
                    });
                    
                });
            });
        });
        
//javascript for likes count
/*

        jQuery(document).ready(function() {
            // Loop through each like button
            jQuery('.like-button').each(function() {
                var button = jQuery(this);
                var articleId = button.data('article-id');
        
                // Check if the article is liked and set the button color accordingly
                var isLiked = localStorage.getItem('liked_' + articleId);
                if (isLiked) {
                    button.addClass('liked');
                }
        
                // Event listener for like button clicks
                button.click(function(event) {
                    event.preventDefault(); // Prevent default click behavior
                    var articleId = button.data('article-id'); // Get the article ID from the data-article-id attribute
        
                    // Send AJAX request to like_post view
                    jQuery.ajax({
                        url: '/like/' + articleId + '/', // URL of the like_post view
                        type: 'POST', // HTTP method
                        beforeSend: function(xhr) {
                            xhr.setRequestHeader("X-CSRFToken", window.csrfToken); // Set CSRF token header
                        },
                        success: function(data) {
                            if (data.liked) {
                                button.addClass('liked'); // Add 'liked' class to change button color
                                localStorage.setItem('liked_' + articleId, true); // Save liked status to localStorage
                            } else {
                                button.removeClass('liked'); // Remove 'liked' class if unliked
                                localStorage.removeItem('liked_' + articleId); // Remove liked status from localStorage
                            }
                        },
                        error: function(xhr, textStatus, errorThrown) {
                            console.log("Error:", errorThrown); // Log any errors to console
                        }
                    });
        
                    // Update the like button's appearance immediately after clicking
                    if (button.hasClass('liked')) {
                        button.removeClass('liked');
                        localStorage.removeItem('liked_' + articleId); // Remove liked status from localStorage
                    } else {
                        button.addClass('liked');
                        localStorage.setItem('liked_' + articleId, true); // Save liked status to localStorage
                    }
                });
            });
        });
        

           

        $(document).ready(function() {
            // Attach click event handler to like buttons
            $('.like-button').click(function(e) {
                e.preventDefault();
                var articleId = $(this).data('article-id');
                var url = '/like/' + articleId + '/';
                
                // Make AJAX request to like_post view
                $.ajax({
                    url: url,
                    type: 'GET',
                    dataType: 'json',
                    success: function(data) {
                        // Update likes count and display message
                        $('.likes-count').text(data.likes);
                    },
                    error: function(xhr, status, error) {
                        console.error('Error:', error);
                    }
                });
            });
        });



























/*


   jQuery(document).ready(function() {
    // Loop through each like button
    jQuery('.like-button').each(function() {
        var button = jQuery(this);
        var articleId = button.data('article-id');

        var isLiked = localStorage.getItem('liked_' + articleId);
        if (isLiked) {
            button.addClass('liked');
        }
        

        
        // Send AJAX request to check if the current user has liked the post
        jQuery.ajax({
            url: '/check_like/' + articleId + '/', // URL to check if the post is liked
            type: 'GET', // Use GET method
            success: function(data) {
                if (data.liked) {
                    button.addClass('liked'); // Add 'liked' class to change button color
                    localStorage.setItem('liked_' + articleId, true); // Save liked status to localStorage
                } else {
                    button.removeClass('liked'); // Remove 'liked' class if unliked
                    localStorage.removeItem('liked_' + articleId); // Remove liked status from localStorage
                }
            },
            error: function(xhr, textStatus, errorThrown) {
                console.log("Error:", errorThrown); // Log any errors to console
                localStorage.removeItem('liked_' + articleId); 
            }
        });
    });

    // Event listener for like button clicks
    jQuery('.like-button').click(function(event) {
        event.preventDefault(); // Prevent default click behavior
        var articleId = jQuery(this).data('article-id'); // Get the article ID from the data-article-id attribute
        var button = jQuery(this); // Store reference to the button

        // Send AJAX request to like_post view
        jQuery.ajax({
            url: '/like/' + articleId + '/', // URL of the like_post view
            type: 'POST', // HTTP method
            beforeSend: function(xhr) {
                xhr.setRequestHeader("X-CSRFToken", window.csrfToken); // Set CSRF token header
            },
            success: function(data) {
                if (data.liked) {
                    button.addClass('liked'); // Add 'liked' class to change button color
                    localStorage.setItem('liked_' + articleId, true);
                } else {
                    button.removeClass('liked'); // Remove 'liked' class if unliked
                    localStorage.removeItem('liked_' + articleId);
                }
            },
            error: function(xhr, textStatus, errorThrown) {
                console.log("Error:", errorThrown); // Log any errors to console
            }
        });
    });
});
*/