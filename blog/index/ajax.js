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

    document.querySelectorAll(".buttonload").forEach(button => {
        button.addEventListener("click", function() {
          var spinnerIcon = this.querySelector(".fa-spinner");
          spinnerIcon.classList.add("fa-spin");
          this.disabled = true; 
        });
      });
      



      $(document).ready(function() {
        var page = 2; // Start with page 2, as page 1 is already loaded
        var articleId = $(".comments-section").data("article-id");
        
        $(".buttonload").click(function() {
            $.ajax({
                url: "/update_comments/" + articleId + "/?page=" + page,
                type: "GET",
                success: function(response) {
                    var commentsData = response.comments;
                    var hasMorePages = response.has_next;
                    var commentsHtml = "";
                    
                    commentsData.forEach(function(comment) {
                        commentsHtml += '<div class="d-flex flex-row comment-row">';
                        commentsHtml += '<div class="p-2"><span class="round"><img src="' + comment.author_image_url + '" alt="user" style="width: 45px; height: 45px; border-radius: 50%;"></span></div>';
                        commentsHtml += '<div class="comment-text w-100">';
                        commentsHtml += '<h5>' + comment.author + '</h5>';
                        commentsHtml += '<div class="comment-footer">';
                        commentsHtml += '<span class="date">' + comment.created_at + '</span>';
                        commentsHtml += '<span class="label label-info">Updated</span>';
                        commentsHtml += '<span class="action-icons">';
                        commentsHtml += '<a href="#" data-abc="true"><i class="fa fa-pencil"></i></a>';
                        commentsHtml += '<a href="#" data-abc="true"><i class="fa fa-rotate-right"></i></a>';
                        commentsHtml += '<a href="#" data-abc="true"><i class="fa fa-heart"></i></a>';
                        commentsHtml += '</span></div>';
                        commentsHtml += '<p class="m-b-5 m-t-10">' + comment.c_ment + '</p>';
                        commentsHtml += '</div></div>';
                    });
                    
                    $(".comments-container").append(commentsHtml);
                    
                    if (hasMorePages) {
                        page++;
                    } else {
                        $(".buttonload").remove();
                    }
                },
                error: function(xhr, status, error) {
                    console.log(error);
                }
            });
        });
    });



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
        

        // Function to update the comments section asynchronously
            function updateComments(articleId) {
                console.log("Article ID:", articleId);
                jQuery.ajax({
                    url: '/update_comments/' + articleId + '/', // URL to fetch comments for the specified article
                    type: 'GET',
                    cache: false,
                    dataType: 'json', // Specify the expected data type as JSON
                    success: function(data) {
                        var commentsSection = jQuery('.comments-section[data-article-id="' + articleId + '"]');
                        commentsSection.empty();
                        

                        // Iterate over the received comments data and append them to the respective comments sections
                        jQuery.each(data.comments, function(index, comment) {
                            var commentHtml = `
                            <div class="d-flex flex-row comment-row" data-article-id="${articleId}">
                                <div class="p-2">
                                    <span class="round"><img src="${comment.author_image_url}" alt="user" style="width: 45px; height: 45px; border-radius: 50%;">
                                        
                                    </span>
                                </div>
                                <div class="comment-text w-100">
                                    <h5>${comment.author}</h5>
                                    <div class="comment-footer">
                                        <span class="date">${formatDate(comment.created_at)}</span>
                                        <span class="label label-info">Updated</span>
                                        <span class="action-icons">
                                            <a href="#" data-abc="true"><i class="fa fa-pencil"></i></a>
                                            <a href="#" data-abc="true"><i class="fa fa-rotate-right"></i></a>
                                            <a href="#" data-abc="true"><i class="fa fa-heart"></i></a>
                                        </span>
                                    </div>
                                    <p class="m-b-5 m-t-10">${comment.c_ment}</p>
                                </div>
                            </div>`;
                        
                            

                            // Append comment to each comments section
                            commentsSection.append(commentHtml);
                            function formatDate(dateString) {
                                var date = new Date(dateString);
                                return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true });
                            }
                        });

                        console.log('Comments updated successfully');
                    },
                    error: function(xhr, textStatus, errorThrown) {
                        console.log("Error:", errorThrown);
                    }
                });
            }

        
        // Event listener for form submission
        jQuery('.comment-form').on('submit', function(event) {
            event.preventDefault();
    
            // Serialize form data
            var formData = jQuery(this).serialize();
            var $form = jQuery(this);
    
            jQuery.ajax({
                url: jQuery(this).attr('action'), // URL from the form's action attribute
                method: jQuery(this).attr('method'), // HTTP method from the form's method attribute
                data: formData, // Form data to send to the server
                success: function(response) {
                    if (response.success) {
                        // Clear the form inputs
                        $form.find('textarea').val('');
                        var articleId = $form.closest('.post').find('.icon.solid.toggle-comment').data('article-id');
                        updateCommentCount(articleId); 
                        var commentsSection = jQuery('.comments-section[data-article-id="' + articleId + '"]');
                        commentsSection.empty();
                        updateComments(articleId);
                        
                        
    
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
    