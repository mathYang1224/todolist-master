// 入口函数
$(function() {
    var task_list = [],
        done_list = []
    init()


})

// 初始化
function init() {


    task_list = store.get('task_list') || []
    done_list = store.get('done_list') || []
    render_task_list()
    render_done_list()
    on_submit()
    delete_all()
    detail_close()

}

// 到时提醒
function time_to_alert() {
    var currentTime

    var timer = setInterval(function() {
        currentTime = (new Date()).getTime()
        for (var i = 0; i < task_list.length; i++) {
            if (task_list[i].date) {
                var taskTime = (new Date(task_list[i].date)).getTime()
                if (currentTime - taskTime >= 1 && currentTime - taskTime <= 1000) {
                    $('audio').get(0).play()
                    alert(task_list[i].content, task_list[i].desc)
                    
                }
            }

        }
    }, 1000)
}

// 渲染列表task
function render_task_list() {
    $('.todo').html('')
    for (var i = 0; i < task_list.length; i++) {
        var $task = render_task_tpl(task_list[i], i)
        $('.todo').append($task)
    }


    delete_one()
    onClick($('.top input'), $('.todo input'))
    detail_click('todo')
    task_to_done()
    time_to_alert()
}
// 渲染列表done
function render_done_list() {
    $('.done').html('')
    for (var i = 0; i < done_list.length; i++) {
        var $done = render_task_tpl(done_list[i], i)
        $('.done').append($done)
    }


    delete_one()
    onClick($('.bottom input'), $('.done input'))
    detail_click('done')
}

// 渲染模板
function render_task_tpl(data, index) {
    var task_list_tpl =
        '<li data-index=' + index + '>' +
        '<input type="checkbox" />' +
        '<span>' + data.content + '</span>' +
        '<a href="javascript:;" class="f_r delete">delete</a>' +
        '<a href="javascript:;" class="f_r detail">detail</a>' +
        '</li>';
    return $(task_list_tpl);
}

// 已完成
function task_to_done() {
    $('.todo input').on('click', function() {
        if ($(this).prop('checked')) {
            var index = $(this).parent().data('index')

            done_list.unshift(task_list.splice(index, 1)[0])

            set_task_list()
            set_done_list()
            render_task_list()
            render_done_list()
        }
    })
}

// 渲染详情
function render_task_detail(target, index) {
    var name = target == 'todo' ? task_list : done_list
    var item = name[index]
    var desc = ''
    if (item.desc) desc = item.desc
    var tpl =
        '<input name="content" class="content" value=' + item.content + '>' +
        '<img src="images/close.png" alt="">' +
        '<textarea name="" id="" placeholder="nothing">' + desc + '</textarea>' +
        '<input type="text" id="datetimepicker" placeholder="time" value="' + (item.date || '') + '">' +
        '<button class="save">save</button>'
    $('.task_detail').html(tpl)
    detail_close()
    updata_task_detail(name, index)
    $('#datetimepicker').datetimepicker();
}

// 更新详情
function updata_task_detail(name, index) {
    $('.save').on('click', function() {
        var data = name[index]
        data.content = $('.task_detail .content').val()
        data.desc = $('.task_detail textarea').val()
        data.date = $('.task_detail input[type=text]').val()
        var dataName = name == task_list ? 'task_list' : 'done_list'
        store.set(dataName, name)
        hide_mask_detail()
        render_task_list($('.todo'))

    })
}


// detail点击事件
function detail_click(target) {
    $('.' + target + ' .detail').on('click', function(e) {
        e.preventDefault
        var index = $(this).parent().data('index')
        render_task_detail(target, index)
        $('.mask').show()
        $('.task_detail').show()
    })
}

// detail关闭事件
function detail_close() {
    $('.mask').on('click', function() {
        hide_mask_detail()
    })
    $('.task_detail img').on('click', function() {
        hide_mask_detail()
    })
}

// 隐藏详情
function hide_mask_detail() {
    $('.mask').hide()
    $('.task_detail').hide()
}

// 点击新增事件
function on_submit() {
    $('button[type=submit]').on('click', function() {
        var new_task = {}
        new_task.content = $('input[type=text]').val()
        if (!new_task.content) return
        if (add_task(new_task)) {
            render_task_list($('.todo'))
        }
        $('input[type=text]').val('')
    })
}

// 删除一条
function delete_one() {
    $('.delete').on('click', function(e) {
        e.preventDefault()
        if (confirm('确定删除吗？')) {
            var className = $(this).parent().parent().attr('class')
            var index = $(this).parent().attr('data-index')
            if (className == 'todo') {
                task_list.splice(index, 1)
                set_task_list()
                render_task_list()
            } else {
                done_list.splice(index, 1)
                set_done_list()
                render_done_list()
            }
        }
    })
}

// 删除多条
function delete_all() {
    $('.delete_all').on('click', function(e) {
        e.preventDefault()
        if (confirm('确定删除吗？')) {
            var className = $(this).parent().attr('class')
            if (className == 'top') {
                task_list = []
                set_task_list()
                render_task_list()
            } else {
                done_list = []
                set_done_list()
                render_done_list()
            }
            $(this).hide().siblings('input').prop('checked', false)

        }

    })
}




// 新增一条
function add_task(new_task) {
    task_list.unshift(new_task)
    set_task_list()
    return true
}

// 设置本地存储
function set_task_list() {
    store.set('task_list', task_list)
}

function set_done_list() {
    store.set('done_list', done_list)
}

// 全选
function check_all(all, target) {
    target.prop('checked', all.prop('checked'));
}

// 显示隐藏删除按钮
function show_hide(all) {
    if (all.prop('checked')) {
        all.siblings('a').fadeIn()
    } else {
        all.siblings('a').fadeOut()
    }
}

// 全选按钮的点击事件
function onClick(all, target) {
    all.on('click', function() {
        check_all(all, target)
        show_hide(all)
    })
}

// 所有选中导致全选
// function to_check_all(inputs, target) {
//     inputs.on('click', function() {
//         var flag = true
//         for (var i = 0; i < inputs.length; i++) {
//             if (inputs.eq(i).prop('checked')) continue
//             flag = false
//         }
//         target.prop('checked', flag)
//         show_hide(target)
//     })
// }