$(() => {
  $('.delete-article').on('click', (e) => {
    $target = $(e.target)
    const id = $target.attr('data-id')
    $.ajax({
      type: "DELETE",
      url: "/articles/" + id,
      success: (res) => {
        alert('DELETE Article')
        window.location = '/'
      },
      error: (err) => {
        console.error(err)
      }
    })

  })
})