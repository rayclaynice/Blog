













document.addEventListener("DOMContentLoaded", function() {
    // Function to toggle comment section visibility
    var toggleComment = function(event) {
        event.preventDefault();
        var commentSection = this.closest(".post").querySelector(".comment-section");
        commentSection.style.display = commentSection.style.display === "none" ? "block" : "none";
    };

    // Attach click event listeners to comment buttons
    var commentIcons = document.querySelectorAll(".toggle-comment");
    commentIcons.forEach(function(commentIcon) {
        commentIcon.addEventListener("click", toggleComment);
    });

    // Event listener for comment form submission
  

//jquery to handle commenting
        
//jquery to handle commenting
jQuery(document).ready(function() {
    function updateCommentCount(articleId) {
        jQuery.ajax({
            url: '/get_comment_count/' + articleId + '/', // URL to fetch the updated like count
            type: 'GET',
            cache: false,
            success: function(data) {
                // Update the like count for the corresponding article
                var commentButton = jQuery('.icon.solid.toggle-comment[data-article-id="' + articleId + '"]');
                commentButton.find('.comment-count').text(data.comment_count); 
                console.log('comment:', data.comment_count);
            },
            error: function(xhr, textStatus, errorThrown) {
                console.log("Error:", errorThrown);
            }
        });
    }
    
    // Event listener for form submission
    jQuery('.comment-form').on('submit', function(event) {
        // Prevent the default form submission behavior
        event.preventDefault();

        // Serialize form data
        var formData = jQuery(this).serialize();
        var $form = jQuery(this);

        // Submit the form using AJAX
        jQuery.ajax({
            url: jQuery(this).attr('action'),
            method: jQuery(this).attr('method'), 
            data: formData, 
            success: function(response) {
                if (response.success) {
                    // Clear the form inputs
                    $form.find('textarea').val('');
                    var articleId = $form.closest('.post').find('.icon.solid.toggle-comment').data('article-id');
                    updateCommentCount(articleId); 

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
