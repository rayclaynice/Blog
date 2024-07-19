
document.addEventListener("DOMContentLoaded", function() {
    // Toggle comment sections
    var commentIcons = document.querySelectorAll(".toggle-comment");

    commentIcons.forEach(function(commentIcon) {
        commentIcon.addEventListener("click", function(event) {
            event.preventDefault();
            var post = this.closest(".post");
            var commentSection = post.querySelector(".comment-section");
            if (commentSection.style.display === "none" || commentSection.style.display === "") {
                commentSection.style.display = "block";
                var articleId = this.dataset.articleId;
                console.log("Showing comments for Article ID:", articleId);
            } else {
                commentSection.style.display = "none";
                console.log("Hiding comments for Article ID:", articleId);
            }
        });
    });
    initializeToggleReplies();
    initializeToggleSubReplies()
    
});

    function handlePagination(event) {
        var button = event.currentTarget;
        var spinnerIcon = button.querySelector(".fa-spinner");
        spinnerIcon.classList.add("fa-spin");
        button.disabled = true;

        var articleId = button.dataset.articleId;
        var nextPage = parseInt(button.dataset.currentPage) + 1 || 2;

        updateComments(articleId, nextPage);
        initializeToggleReplies();
    }

    // Use event delegation to handle clicks on dynamically added buttons
    jQuery(document).on('click', '.buttonload', handlePagination);
    initializeToggleReplies();
    initializeToggleSubReplies()
    initializeReplyForm();





function updateComments(articleId, currentPage = 1, totalPages = 1) {
    jQuery.ajax({
        url: '/update_comments/' + articleId + '/?page=' + currentPage,
        type: 'GET',
        cache: false,
        dataType: 'json',
        beforeSend: function(xhr) {
            xhr.setRequestHeader("X-CSRFToken", window.csrfToken);
        },
        success: function(data) {
            var current_user = data.current_user;
            var commentsSection = jQuery('.comment-widgets[data-article-id="' + articleId + '"]');
            jQuery.each(data.comments, function(index, comment) {
                var formActionUrl = `/get_replies/${comment.id}/`;
                var isCommentAuthor = comment.author === current_user.username;
                var showDeleteAction = isCommentAuthor;
                var commentHtml = `
                <div class="d-flex flex-row comment-row" data-comment-id="${comment.id}">
                    <div class="p-2">
                        <span class="round"><img src="${comment.author_image_url}" alt="user" style="width: 45px; height: 45px; border-radius: 50%;"></span>
                    </div>
                    <div class="comment-text w-100">
                        <h5>${comment.author}</h5>
                        <p class="m-b-5 m-t-10">${comment.c_ment}</p>
                        <div class="comment-footer">
                            <span class="date">${comment.created_at}</span>
                            <span class="action-icons">
                                ${showDeleteAction ? `<a href="#" class="delete-comment" data-comment-id="${comment.id}"><i class="fa fa-trash trash-icon"></i></a>` : ''}
                                <a href="#" class="comment-likes" data-comment-id="${comment.id}">
                                    <i class="fas fa-heart like-icon"></i> 
                                    <span class="like-icons">${comment.comment_likes_count}</span> 
                                </a>
                                <a href="#" class="icon solid toggle-replies" data-comment-id="${comment.id}">
                                    <i class="fas fa-comment"></i>
                                    <span class="comment-count">5</span>
                                </a>
                            </span>
                        </div>
                        <div class="replies-section" data-comment-id="${ comment.id }" style="display: none;">
                                <h3>Replying to @${ comment.author }</h3>
                                <form class="reply-form" method="post" action="${formActionUrl}">
                                <input type="hidden" name="csrfmiddlewaretoken" value="${window.csrfToken}">
                                  <img src="${ current_user.user_image}" style="width: 50px; height: 50px; border-radius: 50%;" alt="user">
                                  <div class="form-controls">
                                    <div class="grow-wrap">
                                      <textarea name="reply_text" rows="1" cols="20" placeholder="Leave a comment for ${ comment.author }" class="comment-textarea" required onInput="this.parentNode.dataset.replicatedValue = this.value"></textarea>
                                    </div>
                                    <input type="submit" value="Reply" class="button primary small">
                                  </div>
                                </form>
                                <div class="reply-widgets m-b-20" data-comment-id="${comment.id}">
                                <!-- Replies will be appended here -->
                            </div>
                        </div>
                        <div class="custom-confirm" data-comment-id="${comment.id}" style="display: none;">
                            <div class="modal-content">
                                <p><strong>Delete</strong><br>Are you sure that you want to delete this comment?</p>
                                <div class="buttons">
                                    <button class="confirm-delete">Delete</button>
                                    <button class="cancel-delete">Cancel</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    </div>`;        
                commentsSection.append(commentHtml);
            });

            // Reinitialize toggle replies after comments are appended
            initializeToggleReplies();
            initializeToggleSubReplies()

            // Reinitialize other functions if necessary
            initializeLikeButtons();
            initializeReplyForm()

            var buttons = $('.buttonload[data-article-id="' + articleId + '"]');
            buttons.each(function() {
                var button = $(this)[0];
                button.dataset.currentPage = currentPage;
                if (!data.has_next) {
                    button.style.display = 'none';
                }
                button.disabled = false;
            });
        },
        error: function(xhr, textStatus, errorThrown) {
            console.log("XHR Status:", xhr.status);
            console.log("XHR Response Text:", xhr.responseText);
            if (xhr.status === 0 || xhr.status === 401 || xhr.responseText.includes('<title>Login</title>')) {
                // Redirect to login page
                window.location.href = '/login/?next=' + encodeURIComponent(window.location.pathname);
            } else {
                console.log("Error:", errorThrown);
                // Handle other errors if necessary
            }
        }
    });
}

function initializeToggleReplies() {
    var replyIcons = document.querySelectorAll(".toggle-replies");

    replyIcons.forEach(function(replyIcon) {
        replyIcon.addEventListener("click", function(event) {
            event.preventDefault();
            var commentSection = this.closest(".comment-row");
            var replySection = commentSection.querySelector(".replies-section");
            var commentId = commentSection.dataset.commentId;

            if (replySection.style.display === "none" || replySection.style.display === "") {
                replySection.style.display = "block";
                console.log("Showing replies for comment ID:", commentId);
                updatereplies(commentId);
            } else {
                replySection.style.display = "none";
                console.log("Hiding replies for comment ID:", commentId);
            }
            initializeToggleSubReplies();
        });
    });
}



function updatereplies(commentId, currentPage = 1) {
    if (!commentId) {
        console.error('Comment ID is undefined');
        return;
    }

    console.log('Updating replies for comment ID:', commentId);

    jQuery.ajax({
        url: '/update_replies/' + commentId + '/?page=' + currentPage,
        type: 'GET',
        cache: false,
        dataType: 'json',
        beforeSend: function(xhr) {
            xhr.setRequestHeader("X-CSRFToken", window.csrfToken);
        },
        success: function(data) {
            var current_user = data.current_user;
            var repliesSection = jQuery('.reply-widgets[data-comment-id="' + commentId + '"]');
            repliesSection.empty();
            var comment = data.comment;
            jQuery.each(data.replies, function(index, reply) {
                var isReplyAuthor = reply.author === current_user.username;
                var showDeleteAction = isReplyAuthor;

                const replyHtml =  `
                <div class="d-flex flex-row reply-row" data-reply-id="${reply.id}">  
                <div class="p-2"><span class="round"><img src="${reply.author_image_url}" style="width: 45px; height: 45px; border-radius: 50%;" alt="user" width="50"></span></div>
                <div class="reply-text w-100">
                    <h5>${reply.author}</h5>
                    <p class="m-b-5 m-t-10">${reply.reply_text}</p>
                    <div class="reply-footer">
                        <span class="date">${reply.created_at}</span>
                        <span class="reply-action-icons">
                            ${showDeleteAction ? `<a href="#" class="delete-comment" data-reply-id="${reply.id}"><i class="fa fa-trash trash-icon"></i></a>` : ''}
                            <a href="#" class="reply-likes" data-reply-id="${reply.id}">
                                <i class="fas fa-heart like-icon"></i> 
                                <span class="like-icons">123</span> 
                            </a>
                            <a href="#" class="icon solid sub-reply" data-comment-id="${comment.id}">
                                <i class="fas fa-comment"></i>
                                <span class="sub-reply-count">5</span>
                            </a>
                        </span>
                    </div>
                    <br>
                    <!-- template to handle delete confirmation-->
                    <div class="custom-confirm" data-reply-id="${reply.id}" style="display: none;">
                        <div class="modal-content">
                            <p><strong>Delete</strong><br>Are you sure that you want to delete this reply?</p>
                            <div class="buttons">
                                <button class="confirm-delete">Delete</button>
                                <button class="cancel-delete">Cancel</button>
                            </div>
                        </div>
                    </div>
                    <!-- Sub-reply form -->
                    
                    <div class="sub-reply-section" data-reply-id="${reply.id}"  style="display: none;>
                    <h3>Replying to @${ reply.author }</h3>
                    <form class="reply-form" method="post" action="">
                    <img src="${ current_user.user_image}" style="width: 50px; height: 50px; border-radius: 50%;" alt="user">
                    <div class="form-controls">
                        <div class="grow-wrap">
                            <textarea name="reply_text" rows="1" cols="20" placeholder="Leave a response for ${ reply.author }" class="comment-textarea" required onInput="this.parentNode.dataset.replicatedValue = this.value"></textarea>
                        </div>
                
                        <input type="submit" value="Reply" class="button primary small">
                        </div>
                    </form>
                    </div>
                </div>
            </div>`;
                
                repliesSection.append(replyHtml);
            });
            initializeToggleReplies();
            initializeToggleSubReplies()
           

            var buttons = $('.buttonload[data-comment-id="' + commentId + '"]');
            buttons.each(function() {
                var button = $(this)[0];
                button.dataset.currentPage = currentPage;
                if (!data.has_next) {
                    button.style.display = 'none';
                }
                button.disabled = false;
            });
        },
        error: function(xhr, textStatus, errorThrown) {
            console.log("XHR Status:", xhr.status);
            console.log("XHR Response Text:", xhr.responseText);
            if (xhr.status === 0 || xhr.status === 401 || xhr.responseText.includes('<title>Login</title>')) {
                window.location.href = '/login/?next=' + encodeURIComponent(window.location.pathname);
            } else {
                console.log("Error:", errorThrown);
            }
        }
    });
}


// Call initializeToggleReplies initially
initializeToggleReplies();


function initializeToggleSubReplies() {
    var subReplyIcons = document.querySelectorAll(".sub-reply");

    subReplyIcons.forEach(function(subReplyIcon) {
        subReplyIcon.addEventListener("click", function(event) {
            event.preventDefault();
            var replySection = this.closest(".reply-row");
            var subReplySection = replySection.querySelector(".sub-reply-section");
            var replyId = replySection.dataset.replyId;

            if (subReplySection.style.display === "none" || subReplySection.style.display === "") {
                subReplySection.style.display = "block";
                console.log("Showing replies for comment ID:", replyId);
                updatereplies(commentId);
            } else {
                subReplySection.style.display = "none";
                console.log("Hiding replies for comment ID:", replyId);
            }
            initializeToggleReplies();
        });
    });
}











    
//updatecomment count asynchrously
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



    $(document).ready(function() {
    // Show confirmation dialog when delete icon is clicked for a specific comment
    $(document).on('click', '.delete-comment', function(event) {
        event.preventDefault();
        var $clickedComment = $(this).closest('.comment-row'); // Find the closest comment row
        var commentId = $(this).data('comment-id');
        var $confirmationDialog = $clickedComment.find('.custom-confirm[data-comment-id="' + commentId + '"]');

        // Show confirmation dialog only for this comment
        $confirmationDialog.show();
    });

    // Handle delete action when confirm button is clicked
    $(document).on('click', '.confirm-delete', function(event) {
        event.preventDefault();
        var $clickedComment = $(this).closest('.comment-row'); // Find the closest comment row
        var commentId = $clickedComment.find('.delete-comment').data('comment-id'); // Find the comment ID within the clicked comment

        // Loop through each article on the page
        $('.comment-widgets').each(function() {
            var articleId = $(this).data('article-id'); // Find the article ID within the comments section
            var currentPage = parseInt($('.buttonload[data-article-id="' + articleId + '"]').data('current-page'));
            var commentsSection = $(this);
            console.log('currrrr', currentPage);

            $.ajax({
                type: 'POST',
                url: '/delete_comments/' + commentId + '/',
                dataType: 'json',
                beforeSend: function(xhr) {
                    xhr.setRequestHeader("X-CSRFToken", window.csrfToken);
                },
                success: function(response) {
                    $clickedComment.remove();
                    $confirmationDialog.hide();
                    for (var i = currentPage; i <= totalPages; i++) {
                        updateComments(articleId, i, totalPages);
                    }
                    console.log(response.message);
                },
                error: function(xhr, status, error) {
                    console.error(xhr.responseText);
                }
            });
            $clickedComment.find('.custom-confirm').hide(); // Find the confirmation dialog within the clicked comment and hide it
        });
    });

    // Hide confirmation dialog when cancel button is clicked
    $(document).on('click', '.cancel-delete', function(event) {
        event.preventDefault();
        var $clickedComment = $(this).closest('.comment-row'); // Find the closest comment row
        $clickedComment.find('.custom-confirm').hide(); // Find the confirmation dialog within the clicked comment and hide it
    });
});








       
        // jquery ajax to handle comment submission for form submission
        jQuery('.comment-form').on('submit', function(event) {
            event.preventDefault();
    
            // Serialize form data
            var formData = jQuery(this).serialize();
            var $form = jQuery(this);
    
            jQuery.ajax({
                url: jQuery(this).attr('action'),
                method: jQuery(this).attr('method'), 
                data: formData, 
                success: function(response) {
                    if (response.redirect_url) {
                        // Perform client-side redirection to the login page
                        window.location.href = response.redirect_url;
                    }
                    else if (response.success) {
                        
                        // Clear the form inputs
                        $form.find('textarea').val('');
                        var articleId = $form.closest('.post').find('.icon.solid.toggle-comment').data('article-id');
                        updateCommentCount(articleId); 
                        var commentsSection = jQuery('.comment-widgets[data-article-id="' + articleId + '"]');
                        //var commentsSection = jQuery('.comments-section[data-article-id="' + articleId + '"]');
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
                    if (xhr.status === 401) {
                        // Perform client-side redirection to the login page
                        window.location.href = '/login/';  // Update with your login page URL
                    }
                    else {
                    console.error('There was a problem with the AJAX request:', error);
                    }
                }
            });
        });
    });


    function initializeReplyForm() {
        jQuery('.reply-form').on('submit', function(event) {
            event.preventDefault();
    
            // Serialize form data
            var formData = jQuery(this).serialize();
            var $form = jQuery(this);
            var commentRow = $form.closest('.comment-row');
            var commentId = commentRow.data('comment-id');
    
            jQuery.ajax({
                url: $form.attr('action'),
                method: $form.attr('method'),
                data: formData,
                success: function(response) {
                    if (response.redirect_url) {
                        window.location.href = response.redirect_url;
                    } else if (response.success) {
                        $form.find('textarea').val('');
                        var replySection = jQuery('.reply-widgets[data-comment-id="' + commentId + '"]');
                        replySection.empty();
                        updatereplies(commentId);
    
                        var replySection = $form.closest('.replies-section');
                        jQuery('html, body').animate({
                            scrollTop: replySection.offset().top
                        }, 1000); // Adjust scroll speed as needed
                    } else {
                        // Handle form errors or other failure scenarios
                        console.error('Form submission failed:', response.errors);
                    }
                },
                error: function(xhr, status, error) {
                    if (xhr.status === 401) {
                        // Perform client-side redirection to the login page
                        window.location.href = '/login/'; // Update with your login page URL
                    } else {
                        console.error('There was a problem with the AJAX request:', error);
                    }
                }
            });
        });
    }
    
    // Call the function to initialize the reply form functionality
    jQuery(document).ready(function() {
        initializeReplyForm();
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
                    likeButton.find('.like-count').text(data.likes_count);
                },
                error: function(xhr, textStatus, errorThrown) {
                    console.log("Error:", errorThrown);
                }
            });
        }
    
        // article like jquery ajax
        jQuery('.like-button').each(function() {
            var button = jQuery(this);
            var articleId = button.data('article-id');
            var isLiked = localStorage.getItem('liked_' + articleId);

            if (isLiked) {
                button.addClass('liked');
            }
            button.click(function(event) {
                event.preventDefault(); 
                var articleId = button.data('article-id');
    
                // Send AJAX request to like or unlike the article
                jQuery.ajax({
                    url: '/like/' + articleId + '/',
                    type: 'POST',
                    beforeSend: function(xhr) {
                        xhr.setRequestHeader("X-CSRFToken", window.csrfToken);
                    },
                    success: function(data) {
                        if (data.error) {
                            // Handle authentication required error
                            window.location.href = '/login/';
                        }
                        else {
                        if (data.liked) {
                            button.addClass('liked');
                            localStorage.setItem('liked_' + articleId, true);
                        } else {
                            button.removeClass('liked');
                            localStorage.removeItem('liked_' + articleId);
                        }
                        // Update the like count after the action is completed
                        updateLikeCount(articleId);
                    }
                },
                    error: function(xhr, textStatus, errorThrown) {
                        if (xhr.status === 401) {
                            // Perform client-side redirection to the login page
                            window.location.href = '/login/';  // Update with your login page URL
                        }
                        else {
                            console.error('There was a problem with the AJAX request:', error);
                            }
                    }
                });
                
            });
        });
    });



// Function to initialize like buttons
function initializeLikeButtons() {
    jQuery('.comment-likes').each(function() {
        var button = jQuery(this);
        var commentId = button.data('comment-id');
        var isLiked = localStorage.getItem('liked_' + commentId);

        if (isLiked) {
            button.addClass('liked');
        }
    });
}

// Function to update comment like count
function updateCommentLikeCount(commentId) {
    jQuery.ajax({
        url: '/get_comment_like_count/' + commentId + '/', // URL to fetch the updated like count
        type: 'GET',
        cache: false,
        success: function(data) {
            // Update the like count for the corresponding article
            var commentLikeButton = jQuery('.comment-likes[data-comment-id="' + commentId + '"]');
            commentLikeButton.find('.like-icons').text(data.comment_likes_count);
        },
        error: function(xhr, textStatus, errorThrown) {
            console.log("Error:", errorThrown);
        }
    });
}

// Event listener for like button click
jQuery(document).on('click', '.comment-likes', function(event) {
    console.log("Like button clicked");
    event.preventDefault(); // Prevent default click behavior

    var button = jQuery(this);
    var commentId = button.data('comment-id');
    var isLiked = localStorage.getItem('liked_' + commentId);
    

    // Send AJAX request to like or unlike the comment
    jQuery.ajax({
        url: '/like_comment/' + commentId + '/',
        type: 'POST',
        beforeSend: function(xhr) {
            xhr.setRequestHeader("X-CSRFToken", window.csrfToken);
        },
        success: function(data) {
            if (data.error) {
                // Handle authentication required error
                window.location.href = '/login/';
            }
            else {
            if (data.liked) {
                button.addClass('liked');
                localStorage.setItem('liked_' + commentId, true);
            } else {
                button.removeClass('liked');
                localStorage.removeItem('liked_' + commentId);
            }
            // Update the like count after the action is completed
            updateCommentLikeCount(commentId);
        }
        },
        error: function(xhr, textStatus, errorThrown) {
            if (xhr.status === 401) {
                // Perform client-side redirection to the login page
                window.location.href = '/login/';  // Update with your login page URL
            }
            else {
                console.error('There was a problem with the AJAX request:', error);
                }
        }
    });
});

// Call initializeLikeButtons function on document ready
jQuery(document).ready(function() {
    initializeLikeButtons();
});





$(document).ready(function() {
    $('#registration-form').on('submit', function(e) {
        e.preventDefault();
        var formdata = $(this).serialize(); // Serialize the form data

        $.ajax({
            type: 'POST',
            url: '/register/',
            data: formdata,
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    window.location.href = '/email-verification-sent/';
                } else {
                    console.error('Registration failed, please check your input');
                }
            },
            error: function(xhr, errmsg, err) {
                console.error('An error occurred while processing your request:', errmsg); // Log error message to the console
                console.error('Error details:', err); // Log error details to the console
            }
        });
    });
});
